const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 6969;
const mongoUrl = "mongodb://127.0.0.1:27017/ecodrop";
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const residence = require("./models/residence.js");
const business = require("./models/business.js");
const expressError = require("./utils/expressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const partner = require("./models/partner.js");
const axios = require("axios");
const openCage = require("opencage-api-client");
const getnearestfacility = require("./utils/findfacility.js");
const passport = require("passport");
const localPassport = require("passport-local");
const logging = require("./models/authentication.js");
const session = require("express-session");
const flash = require("connect-flash");
const customerPartners = require("./models/customerPartner.js");
const {isLoggedIn} = require("./middleware.js");
const {saveRedirectUrl} = require("./middleware.js");
const feedback = require("./models/feedback.js");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
    }
}

main().then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    mongoose.connect(mongoUrl);
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/",(req,res)=>{
    res.render("listings/index.ejs");
});

passport.use(new localPassport(logging.authenticate()));
passport.serializeUser(logging.serializeUser());
passport.deserializeUser(logging.deserializeUser());

app.get("/signup",(req,res)=>{
    if(req.isAuthenticated()){
        req.flash("error","You are already logged In");
        return res.redirect("/partner");
    }
    res.render("listings/signup.ejs");
})

app.post("/signup", async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        let newlogging = new logging({
            email: email,
            username: username
        });
        const registeredUser = await logging.register(newlogging, password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to EcoDrop");
            return res.redirect("/partner");
        });
    }catch(err){
        req.flash("error",err);
        res.redirect("/signup");
    }
})

app.get("/signout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
    });
    req.flash("success","Successfuly logged out!");
    res.redirect("/");
})

app.get("/signin",(req,res)=>{
    res.render("listings/signin.ejs");
});

app.post("/signin", saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/signin",
        failureFlash: true,
}), async (req,res)=>{
    req.flash("success", "Welcome Back to EcoDrop");
    res.redirect("/");
})

app.get("/history",saveRedirectUrl,isLoggedIn, wrapAsync(async(req,res)=>{
    let partners = await customerPartners.find({partneremail: req.user.email});
    res.render("listings/history.ejs", {partners});
}));

app.get("/residence",(req,res)=>{
    if(req.isAuthenticated()){
        req.flash("error", "Partners are restricted to sell E-Waste");
        return res.redirect("/partner");
    }
    res.render("listings/residencecontact.ejs");
});

app.get("/services",async (req,res)=>{
    try{
        let reviews = await feedback.find();
        // console.log(reviews);
        res.render("listings/services.ejs",{reviews});
    }catch(err){
        console.log(err);
    }
});

app.get("/business",(req,res)=>{
    if(req.isAuthenticated()){
        req.flash("error", "Partners are restricted to sell E-Waste");
        return res.redirect("/partner");
    }
    res.render("listings/businesscontact.ejs");
});

app.post("/newresidence",wrapAsync(async (req,res)=>{
    if(!req.body.residence){
        throw new expressError(400, "send valid data for contact");
    }
    let newresidence = new residence(req.body.residence);
    await newresidence.save();
    req.flash("success", "Request Accepted");
    let address = req.body.residence.address;
    res.redirect("/residence");
    try{
        const data = await openCage.geocode({ q: address , key: process.env.APIKEY});
        // console.log(data);
        const coordinates = data.results[0].geometry;
        // console.log(coordinates);
        const customerLat = coordinates.lat;
        const customerLng  = coordinates.lng;
        await getnearestfacility(newresidence, customerLat, customerLng);
    }catch(err){
        req.flash("error", err);
        res.redirect("/residence");
    }
}));

app.post("/newbusiness",wrapAsync(async (req,res)=>{
    if(!req.body.business){
        throw new expressError(400, "send vaild details for contact");
    }
    
    let newbusiness = new business(req.body.business);
    await newbusiness.save();
    req.flash("success","Submitted Successfully!");
    res.redirect("/business");
    let address = req.body.business.address + " " + req.body.business.city + " " + req.body.business.country;
    try{
        const data = await openCage.geocode({ q: address , key: process.env.APIKEY});
        const coordinates = data.results[0].geometry;
        const businessLat = coordinates.lat;
        const businessLng  = coordinates.lng;
        getnearestfacility(newbusiness, businessLat, businessLng);
    }catch(err){
        req.flash("error", err);
        res.redirect("/business");
    }
}));

app.get("/partner",(req,res)=>{
    res.render("listings/partner.ejs");
});

app.get("/partnerform",saveRedirectUrl,isLoggedIn,(req,res)=>{
    res.render("listings/partnerform");
});

app.post("/newpartner",wrapAsync(async(req,res)=>{
    if(!req.body.facility){
        throw new expressError(405, "database validation failed");
    }
    let address = req.body.facility.address + req.body.facility.city + " " + req.body.facility.state + " " +  req.body.facility.country;
    console.log(address);
    try{
        const data = await openCage.geocode({ q: address , key: process.env.APIKEY});
        const coordinates = data.results[0].geometry;
        const lat = coordinates.lat;
        const lng = coordinates.lng;

        let newpartner = new partner({
            facilityname: req.body.facility.facilityname,
            facilityid: req.body.facility.facilityid,
            email: req.body.facility.email,
            mobileno: req.body.facility.mobileno,
            ewaste: req.body.facility.ewaste,
            services: req.body.facility.services,
            days: req.body.facility.days,
            address: req.body.facility.address,
            pincode: req.body.facility.pincode,
            city: req.body.facility.city,
            state: req.body.facility.state,
            country: req.body.facility.country,
            geometry:{
                type: 'Point',
                coordinates:[lat, lng],
            }
        });
        await newpartner.save();
        res.redirect("/partner");
    }catch(err){
        req.flash("error",err);
        res.redirect("/newpartner");
    }
    
}));

app.get("/mission",(req,res)=>{
    res.render("listings/mission.ejs");
});

app.get("/team",(req,res)=>{
    res.render("listings/team.ejs");
})

app.get("/feedback",(req,res)=>{
    res.render("listings/feedback.ejs");
})

app.get("*",(req,res,next)=>{
    next(new expressError(statusCode=404, message= "page not found!"));
});

// Error Handling Middleware
app.use((err,req,res,next)=>{
    let{statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).send(message);
});

app.post("/newfeedback", wrapAsync( async (req,res)=>{
    let newFeedback = new feedback(req.body.feedback);
    await newFeedback.save();
    req.flash("success", "Your Feedback is Successfully Submited");
    res.redirect("/feedback");
}));
app.listen(port, ()=>{
    console.log(`app is listening on port number ${port}`);
});

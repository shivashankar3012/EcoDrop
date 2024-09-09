const mongoose = require("mongoose");
const schema = mongoose.Schema;

const businessSchema = new schema({
    businessname:{
        type:String,
        required:true
    },
    firstname:{
        type:String,
        required: true
    },
    lastname:{
        type:String
    },
    contact: {
        type:Number,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    ewaste: {
        type:String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    city:{
        type:String,
        required: true
    },
    country:{
        type:String,
        required: true
    }
});

const business = mongoose.model("business", businessSchema);
module.exports = business;
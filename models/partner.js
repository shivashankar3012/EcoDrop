const mongoose = require("mongoose");
const schema = mongoose.Schema;

const partnerSchema = new schema({
    facilityname:{
        type:String,
        required:true
    },
    facilityid:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    mobileno:{
        type: String,
        required: true
    },
    ewaste:{
        type: String,
        required: true
    },
    services:{
        type: String,
        required: true
    },
    days:{
        type: String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    pincode:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    geometry:{
        type:{
            type:String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        },
    },
    // customer:{
    //     name:{
    //         type: String,
    //     },
    //     email:{
    //         type:String,
    //     }
    // }
});

const partner = mongoose.model("partner", partnerSchema);
module.exports = partner;
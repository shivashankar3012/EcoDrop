const mongoose = require("mongoose");
const schema = mongoose.Schema;

const residenceSchema = new schema({
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
    housenumber:{
        type:String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    
});

const residence = mongoose.model("residence", residenceSchema);
module.exports = residence;
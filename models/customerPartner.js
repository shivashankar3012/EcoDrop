const mongoose = require("mongoose");
const schema = mongoose.Schema;

const customerPartnerSchema = new schema({
    partneremail:{
        type: String,
    },
    businessname:{
        type: String,
    },
    customername:{
        type: String,
    },
    customeremail:{
        type: String,
    },
    customerewaste:{
        type: String,
    },
    customeraddress:{
        type: String
    },
}) 

const customerPartner = mongoose.model("customerPartners", customerPartnerSchema);
module.exports = customerPartner;
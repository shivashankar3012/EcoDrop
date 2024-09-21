const mongoose = require('mongoose');
const schema = mongoose.Schema;

const feedbackSchema = new schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true
    }
})

const feedback = mongoose.model("feedback", feedbackSchema);
module.exports = feedback;

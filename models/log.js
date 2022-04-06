const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    address:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Log', logSchema)
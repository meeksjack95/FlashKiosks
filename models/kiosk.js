const mongoose = require('mongoose')

const kioskSchema = new mongoose.Schema({
    address:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Kiosk', kioskSchema)
var mongoose = require('mongoose')

var itemSchema = new mongoose.Schema({
    itemNumber: String,
    name: String,
    quantityOnHand: Number,
    quantityAvailable: Number
})

module.exports = mongoose.model('Item', itemSchema)
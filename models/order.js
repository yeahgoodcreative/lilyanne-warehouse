var mongoose = require('mongoose')

var orderSchema = new mongoose.Schema({
    orderId: String,
    dateCreated: String,
    dateModified: String,

    orderInfo: {},
    orderDetailsInfo: [],

    integration: {}
})

module.exports = mongoose.model('Order', orderSchema)
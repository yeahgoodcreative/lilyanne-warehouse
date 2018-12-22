var mongoose = require('mongoose')

var orderSchema = new mongoose.Schema({
    orderId: String,
    dateCreated: String,
    dateModified: String,

    orderInfo: {},
    orderDetailsInfo: []
})

module.exports = mongoose.model('Order', orderSchema)
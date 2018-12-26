var mongoose = require('mongoose')

var binSchema = new mongoose.Schema({
    binNumber: String,
    location: String,
    memo: String,
    items: []
})

module.exports = mongoose.model('Bin', binSchema)
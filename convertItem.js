// Modules
var mongoose = require('mongoose')
var parse = require('csv-parse')
var assert = require('assert')
var fs = require('fs')

var bins = require('./bins.json')

// Mongoose Models
var Order = require('./models/order.js')
var Bin = require('./models/bin.js')
var Item = require('./models/item.js')

// Mongoose Connection
mongoose.connect('mongodb://157.230.40.86:27017/lilyanneintegration', {useNewUrlParser: true, authSource: 'admin', user: 'yeahgood', pass: 'beginnings01'})
var db = mongoose.connection

// Mongoose DB log errors
db.on('error', console.error.bind(console, 'Connection error: '))

// Mongoose DB opened
db.once('open', function() {

    var input = fs.readFileSync('./Items977.csv')

    parse(input, {
        comment: '#'
    }, 
    function(err, output){
        if (err) {
            console.log(err)
        }

        var promises = []

        // For loop ignoring first row
        for (var i = 1; i < output.length; i++) {
            var itemNumber = output[i][0]
            var name = output[i][1]

            // Stor items in db
            var item = new Item({
                itemNumber: itemNumber,
                name: name,
                quantityOnHand: 0,
                quantityAvailable: 0
            })

            promises.push(item.save())
        }

        Promise.all(promises).then(function(results) {
            console.log('Done!')
        })
    })

})
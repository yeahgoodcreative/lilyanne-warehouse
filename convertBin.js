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

    var input = fs.readFileSync('./Bins743.csv')

    parse(input, {
        comment: '#'
    }, 
    function(err, output){
        if (err) {
            console.log(err)
        }

        var binPromises = []

        // For loop ignoring first row
        for (var i = 1; i < output.length; i++) {
            console.log(output[i])

            var binNumber = output[i][0]
            var location = output[i][1]
            var memo = output[i][2]


            // var binPromise = new Promise(function(resolve, reject) {
            //     // A place to store items promises
            //     var itemPromises = []
                
            //     // Iterate through items
            //     // for (item of bin.items) {
            //     //     // Push item to array
            //     //     itemPromises.push(Item.findOne({itemNumber: item['item-number']}))
            //     // }
    
            //     var binObject = {bin: bin, itemPromises: itemPromises}
    
    
            //     resolve(binObject)
    
            // })

            // binPromise.then(function(binObject) {
            
                // Promise.all(binObject.itemPromises).then(function(items) {
    
                    var itemIds = []
    
                    // for (item of items) {
                    //     itemIds.push(item.id)
                    // }
    
                    var newBin = Bin({
                        binNumber: binNumber,
                        location: location,
                        memo: memo,
                        items: itemIds
                    })
    
                    binPromises.push(newBin.save())
                // })
            // })
        }

        Promise.all(binPromises).then(function(results) {
            if (err) {
                console.log(err)
            }

            console.log('Done!')
        })

    })

    // var binPromises = []
    // var count = 1

    // // Iterate through bins
    // for (bin of bins['bins']) {
        
    //     var binPromise = new Promise(function(resolve, reject) {
    //         // A place to store items promises
    //         var itemPromises = []
            
    //         // Iterate through items
    //         for (item of bin.items) {
    //             // Push item to array
    //             itemPromises.push(Item.findOne({itemNumber: item['item-number']}))
    //         }

    //         var binObject = {bin: bin, itemPromises: itemPromises}


    //         resolve(binObject)

    //     })


    //     binPromise.then(function(binObject) {
            
    //         Promise.all(binObject.itemPromises).then(function(items) {

    //             var itemIds = []

    //             for (item of items) {
    //                 itemIds.push(item.id)
    //             }

    //             var newBin = Bin({
    //                 binNumber: binObject.bin['bin-number'],
    //                 location: binObject.bin['location'],
    //                 memo: binObject.bin['memo'],
    //                 items: itemIds
    //             })

    //             newBin.save(function(err) {
    //                 if (err) {
    //                     console.log(err)
    //                 }

    //                 console.log('Created bin ' + count++)
    //             })
    //         })
    //     })
    // }

})
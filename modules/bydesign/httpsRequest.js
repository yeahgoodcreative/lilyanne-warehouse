//  File: httpRequest.js
//  Package: bydesign
//
//  Created by Samuel Black on 29/11/2018.
//  Copyright (C) Yeah Good Creative 2018. All Rights Reserved.
//

module.exports = function (apiPath, data, callback) {
    // Modules
    var config = require('./config')
    var https = require('https')

    var xml2js = require('xml2js')
    var xmlParser = xml2js.parseString

    // Request options
    var options = {
        hostname: config.hostname,
        port: config.port,
        path: config.path + apiPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            'Content-Length': data.length
        }
    }

    // Create request
    var req = https.request(options, function(res) {

        // A place to store body buffer
        var bodyBuffer = ''

        // Event: Data
        res.on('data', function(body) {
            // Add body buffer piece to bodyBuffer
            bodyBuffer += body
        })

        // Event: End
        res.on('end', function() {
            // Convert body buffer to string
            var xmlString = bodyBuffer.toString()

            //console.log(bodyBuffer)

            // Parse xml string
            var xml = xmlParser(xmlString, function (err, res) {
                // Return xml object through callback
                callback(res)
            })
        })
    })

    // On request error
    req.on('error', function(err) {
        console.log('Error: ' + err.message)
    })

    // Write request data and end
    req.write(data)
    req.end()
}
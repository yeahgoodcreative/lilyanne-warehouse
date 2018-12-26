//  File: parseXmlFile.js
//  Package: bydesign
//
//  Created by Samuel Black on 02/11/2018.
//  Copyright (C) Yeah Good Creative 2018. All Rights Reserved.
//

module.exports = function(xmlPath, callback) {
    // Modules
    var fs = require('fs')
    var xml2js = require('xml2js')

    var xmlParser = xml2js.parseString

    // Read xml file to buffer
    fs.readFile(xmlPath, function (err, data) {

        // Log error
        if (err) {
            console.log(err)
        }

        // Buffer to string
        var xmlString = data.toString()
    
        // Parse xml
        var xml = xmlParser(xmlString, function (err, res) {
            // Log error
            if (err) {
                console.log(err)
            }

            // Return xml object through callback
            callback(res)
        })

    })
}
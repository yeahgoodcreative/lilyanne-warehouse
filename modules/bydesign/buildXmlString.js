//  File: buildXmlString.js
//  Package: bydesign
//
//  Created by Samuel Black on 02/12/2018.
//  Copyright (C) Yeah Good Creative 2018. All Rights Reserved.
//

module.exports = function(xmlObject, callback) {
    var xml2js = require('xml2js')
    var xmlBuilder = xml2js.Builder

    // Create new xml builder
    var builder = new xmlBuilder()

    // Return xml string
    var xmlString = builder.buildObject(xmlObject)

    // Return xml string through callback
    callback(xmlString)
}
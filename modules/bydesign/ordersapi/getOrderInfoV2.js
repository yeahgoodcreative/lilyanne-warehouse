//  File: getOrderInfoV2.js
//  Package: bydesign
//
//  Created by Samuel Black on 01/12/2018.
//  Copyright (C) Yeah Good Creative 2018. All Rights Reserved.

module.exports = function (token, orderId, callback) {
    
    // Modules
    var config = require('../config')
    var httpsRequest = require('../httpsRequest')

    var parseXmlFile = require('../parseXmlFile')
    var buildXmlString = require('../buildXmlString')

    // Variables
    var apiPath = config.orderapi_path
    var xmlPath = 'modules/bydesign/ordersapi/getOrderInfoV2.xml'

    // Parse xml file from path
    parseXmlFile(xmlPath, function(xmlObject) {
        // Envelope data
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderInfo_V2'][0]['Credentials'][0].Username = config.username
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderInfo_V2'][0]['Credentials'][0].Password = config.password
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderInfo_V2'][0]['Credentials'][0].Token = token
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderInfo_V2'][0].OrderID = orderId

        // Build xml string from object
        buildXmlString(xmlObject, function(xmlString) {
            // Make https request
            httpsRequest(apiPath, xmlString, function(res) {
                // Return api response through callback
                callback(res)
            })
        })
    })
}
//  File: getOrderListRecent.js
//  Package: byDesignApi
//
//  Created by Samuel Black on 29/11/2018.
//  Copyright (C) Yeah Good Creative 2018. All Rights Reserved.
//

module.exports = function (token, periodType, periodLength, evalDateLastModified, callback) {
    
    // Modules
    var config = require('../config')
    var httpsRequest = require('../httpsRequest')

    var parseXmlFile = require('../parseXmlFile')
    var buildXmlString = require('../buildXmlString')

    // Variables
    var apiPath = config.orderapi_path
    var xmlPath = 'modules/bydesign/ordersapi/getOrderListRecent.xml'

    // Parse xml file from path
    parseXmlFile(xmlPath, function(xmlObject) {
        // Envelope data
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderListRecent'][0]['Credentials'][0].Username = config.username
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderListRecent'][0]['Credentials'][0].Password = config.password
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderListRecent'][0]['Credentials'][0].Token = token
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderListRecent'][0].PeriodType = periodType
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderListRecent'][0].PeriodLength = periodLength
        xmlObject['soap12:Envelope']['soap12:Body'][0]['GetOrderListRecent'][0].EvalDateLastModified = evalDateLastModified

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
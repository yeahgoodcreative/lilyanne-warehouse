// Modules
var express = require('express')
var app = express()

var mustacheExpress = require('mustache-express')
var mongoose = require('mongoose')

var PDFDocument = require('pdfkit')
var fs = require('fs')

var byDesign = require('./modules/bydesign')
var bodyParser = require('body-parser')


// Mongoose Models
var Order = require('./models/order.js')
var Bin = require('./models/bin.js')
var Item = require('./models/item.js')


// Express Engine Config
app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'))

// Express Body Parser Config
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// Mongoose Connection
mongoose.connect('mongodb://lilyannejewellery.yeahgoodcreative.com.au:27017/lilyanneintegration', {useNewUrlParser: true, authSource: 'admin', user: 'yeahgood', pass: 'beginnings01'})
var db = mongoose.connection


// Routes
app.get('/', function(req, res) {
    res.redirect('/orders')
})

app.get('/orders', function(req, res) {
    Order.find({}).sort({orderId: -1}).exec(function(err, orders) {
        if (err) {
            console.log(err)
        }

        res.render('warehouse/orders', {orders: orders})
    })
})

app.get('/orders/orderlabel', function(req, res) {

    // Set response content type
    res.contentType('application/pdf')

    // Get date
    var today = new Date()
    var day = today.getDate()
    var month = today.getMonth() + 1
    var year = today.getFullYear()

    var date = day + '/' + month + '/' + year

    // PDF document setup
    var doc = new PDFDocument({size: [3*72, 2*72], margin: 16})
    doc.pipe(res)

    // Set font size
    doc.fontSize(16)

    // Bill to block
    doc.text(' ')
    doc.text(' ')
    doc.font('./public/fonts/Roboto-Medium.ttf')
    doc.text('Order ID: ' + req.query.orderId)
    doc.font('./public/fonts/Roboto-Regular.ttf')
    doc.text('Date: ' + date)

    // End document
    doc.end()
})

app.get('/orders/packslip', function(req, res) {

    // Set response content type
    res.contentType('application/pdf')

    // Find order in database
    Order.findOne({orderId: req.query.orderId}).exec(function(err, order) {

        // PDF document setup
        var doc = new PDFDocument({size: [3.14961*72, 11.6929*72], margin: 14.1732})
        doc.pipe(res)

        // Insert image
        doc.image('./public/img/lilyannejewellery-logo.png', (3.14961-1.5)/2*72, 20, {width: 1.5*72})

        // Set font size
        doc.fontSize(8)

        // Bill to block
        doc.font('./public/fonts/Roboto-Medium.ttf')
        doc.text('Bill To:', 15, 90)
        doc.font('./public/fonts/Roboto-Regular.ttf')
        doc.text(order.orderInfo.billName1)
        doc.text(order.orderInfo.billStreet1)
        doc.text(order.orderInfo.billCity + ', ' + order.orderInfo.billState + ' ' + order.orderInfo.billPostalCode)
        doc.text(order.orderInfo.billCountry)

        // Spacer
        doc.text(' ')

        // Ship to block
        doc.font('./public/fonts/Roboto-Medium.ttf')
        doc.text('Ship To:')
        doc.font('./public/fonts/Roboto-Regular.ttf')
        doc.text(order.orderInfo.shipName1)
        doc.text(order.orderInfo.shipStreet1)
        doc.text(order.orderInfo.shipCity + ', ' + order.orderInfo.shipState + ' ' + order.orderInfo.shipPostalCode)
        doc.text(order.orderInfo.shipCountry)
        
        // Spacer
        doc.text(' ')

        // Order id block
        doc.font('./public/fonts/Roboto-Medium.ttf')
        doc.text('Order ID: ' + order.orderId)
        doc.font('./public/fonts/Roboto-Regular.ttf')

        // Spacer
        doc.text(' ')
        doc.text(' ')
        doc.text(' ')

        // Iterate through items
        for (item of order.orderDetailsInfo) {
            var itemPacked = 0

            for (integrationItem of order.integration.pack.items) {
                if (integrationItem.productId == item.productId) {
                    itemPacked = integrationItem.picked
                }
            }

            // Line items block
            doc.font('./public/fonts/Roboto-Medium.ttf')
            doc.text(item.productId + ' - ' + item.description)
            doc.font('./public/fonts/Roboto-Regular.ttf')
            doc.text('Qty Ordered:' + item.quantity)
            doc.text('Qty Packed: ' + itemPacked)
            doc.text(' ')
        }

        // End document
        doc.end()
    })
})

app.get('/bins', function(req, res) {
    Bin.find({}).sort({binNumber: 1}).exec(function(err, bins) {
        res.render('warehouse/bins', {bins: bins})
    })
})

app.get('/items', function(req, res) {
    Item.find({}).exec(function(err, items) {
        res.render('warehouse/items', {items: items})
    })
})


// Scanner Routes
app.get('/scanner/', function(req, res) {
    res.render('scanner/index', {})
})

app.get('/scanner/sales-order-picking1', function(req, res) {
    res.render('scanner/sales-order-picking1', {})
})

app.post('/scanner/sales-order-picking2', function(req, res) {
    // Store order number from body
    var orderNumber = req.body['sales-order-number']

    // Get order info from order number
    getOrderInfo(orderNumber, function(order) {

        // Arrays to store values
        var itemPromises = []
        var promises = {items: [], binPromises: []}

        // Itreate through order details
        for (detail of order.orderDetails) {

            // Push promise to array
            itemPromises.push(Item.findOne({itemNumber: detail.productId}))
        }

        // Get promised items
        Promise.all(itemPromises).then(function(items) {
            // console.log(items)

            // Itreate through items
            for (item of items) {
                
                // Check item exists
                if (item) {
                    // Push item to promises object
                    promises.items.push(item)

                    // Push bin promise to promises object
                    promises.binPromises.push(Bin.findOne({items: item.id}))
                }
            }

            // Get promised bins
            Promise.all(promises.binPromises).then(function(bins) {

                // Iterate through order details
                for (var [detailIndex, detail] of order.orderDetails.entries()) {
                    
                    // Iterate through bins
                    for (var [binIndex, bin] of bins.entries()) {

                        // Check if item numbers match
                        if (bin && promises.items[binIndex].itemNumber == detail.productId) {
                            // Add binNumber to orderDetails object
                            order.orderDetails[detailIndex].binNumber = bin.binNumber
                        }
    
                    }
                }

                // Render view
                res.render('scanner/sales-order-picking2', {"orderId": order.orderId, "orderDetails": order.orderDetails})
            })
        })
    })
})

app.post('/scanner/sales-order-picking3', function(req, res) {
    var orderId = req.body['orderId']
    var items = req.body['items']

    var result = {
        integration: {
            pack: {
                status: '',
                items: []
            }
        }
    }
    result.integration.pack.items = items

    // Pack status flags
    var packCount = 0
    var fullPack = true

    // Iterate through items
    for (item of items) {
        if (item.picked != item.quantity) {
            fullPack = false
        }
        else {
            packCount++
        }
    }

    // Set pack status
    if (fullPack && packCount > 0) {
        result.integration.pack.status = 'Packed'
    }
    else if (!fullPack && packCount > 0) {
        result.integration.pack.status = 'Partial'
    }
    else {
        result.integration.pack.status = 'Not Packed'
    }

    console.log(result)

    // Save order object in database
    Order.findOneAndUpdate({orderId: orderId}, result, {upsert: true}, function(err, order) {
        // Log Error
        if (err) {
            console.log('[ERROR] ' + err)
        }
    })

    res.redirect('/scanner')
})


// Mongoose DB log errors
db.on('error', console.error.bind(console, 'Connection error: '))

// Mongoose DB opened
db.once('open', function() {
    // Express Listen
    app.listen('8080', function() {
        console.log('[INFO] Server listening on localhost:8080.')
    })
})

function getOrderInfo(orderId, callback) {
    // Order info promise
    var orderInfoPromise = new Promise(function(resolve, reject) {

        byDesign.getOrderInfoV2('', orderId, function(orderInfo) {
            orderInfo = orderInfo['soap:Envelope']['soap:Body'][0]['GetOrderInfo_V2Response'][0]['GetOrderInfo_V2Result'][0]
        
            // Create a current order object
            var currentOrderInfo = {
                repNumber: orderInfo.RepNumber[0],
                customerNumber: function () {
                    if (orderInfo.CustomerNumber)
                        return orderInfo.CustomerNumber[0]
                    else
                        return ''
                },
                status: orderInfo.Status[0],
                orderDate: orderInfo.OrderDate[0],
                billName1: orderInfo.BillName1[0],
                billName2: orderInfo.BillName1[0],
                billStreet1: orderInfo.BillStreet1[0],
                billStreet2: orderInfo.BillStreet1[0],
                billCity: orderInfo.BillCity[0],
                billState: orderInfo.BillState[0],
                billPostalCode: orderInfo.BillPostalCode[0],
                billCountry: orderInfo.BillCountry[0],
                billEmail: orderInfo.BillEmail[0],
                billPhone: orderInfo.BillPhone[0],
                shipName1: orderInfo.ShipName1[0],
                shipName2: orderInfo.ShipName2[0],
                shipStreet1: orderInfo.ShipStreet1[0],
                shipStreet2: orderInfo.ShipStreet2[0],
                shipCity: orderInfo.ShipCity[0],
                shipState: orderInfo.ShipState[0],
                shipPostalCode: orderInfo.ShipPostalCode[0],
                shipGeoCode: orderInfo.ShipGeoCode[0],
                shipCountry: orderInfo.ShipCountry[0],
                shipEmail: orderInfo.ShipEmail[0],
                shipPhone: orderInfo.ShipPhone[0],
                invoiceNotes: orderInfo.InvoiceNotes[0],
                shipMethodId: orderInfo.ShipMethodID[0],
                shipMethod: orderInfo.ShipMethod[0],
                rankPriceType: orderInfo.RankPriceType[0],
                partyId: orderInfo.PartyID[0],
                currencyTypeId: orderInfo.CurrencyTypeID[0],
                giftOrder: orderInfo.GiftOrder[0],
                alternateShipMethodId: orderInfo.AlternateShipMethodID[0]
            }

            // Resolve promise with orderInfo
            resolve(currentOrderInfo)
        })
    })

    // Order detail info promise
    var orderDetailInfoPromise = new Promise(function(resolve, reject) {
        byDesign.getOrderDetailsInfoV2('', orderId, function(orderDetailsInfo) {
            orderDetailsInfo = orderDetailsInfo['soap:Envelope']['soap:Body'][0]['GetOrderDetailsInfo_V2Response'][0]['GetOrderDetailsInfo_V2Result'][0]['OrderDetailsResponse'][0]['OrderDetailsResponseV2']
        
            // Array to hold details
            var orderDetailsInfoArray = []
        
            // Iterate through each order detail
            if (orderDetailsInfo) {
                for (detailInfo of orderDetailsInfo) {
                    var detailInfoObject = {
                        partyId: detailInfo.PartyID[0],
                        orderDetailId: detailInfo.OrderDetailID[0],
                        productId: detailInfo.ProductID[0],
                        description: detailInfo.Description[0],
                        quantity: detailInfo.Quantity[0],
                        price: detailInfo.Price[0],
                        volume: detailInfo.Volume[0],
                        tax: detailInfo.Tax[0],
                        taxableAmount: detailInfo.TaxableAmount[0],
                        groupOwner: detailInfo.GroupOwner[0],
                        parentOrderDetailId: detailInfo.ParentOrderDetailID[0],
                        warehouseName: detailInfo.WarehouseName[0],
                        warehouseEmail: detailInfo.WarehouseEmail[0],
                        warehousePackSlipLine1: detailInfo.WarehousePackSlipLine1[0],
                        warehousePackSlipLine2: detailInfo.WarehousePackSlipLine2[0],
                        warehousePackSlipLine3: detailInfo.WarehousePackSlipLine3[0],
                        warehousePackSlipLine4: detailInfo.WarehousePackSlipLine4[0],
                        warehousePackSlipLine5: detailInfo.WarehousePackSlipLine5[0],
                        warehousePackSlipLine6: detailInfo.WarehousePackSlipLine6[0],
                        warehousePickupLocation: detailInfo.WarehousePickupLocation[0],
                        warehouseCompanyTaxId: detailInfo.WarehouseCompanyTaxID[0],
                        warehouseIntlCompanyName: detailInfo.WarehouseIntlCompanyName[0],
                        warehousePackSlipTaxTitle: detailInfo.WarehousePackSlipTaxTitle[0],
                        warehousePackSlipTaxPercentage: detailInfo.WarehousePackSlipTaxPercentage[0],
                        packSlipProcessId: detailInfo.PackSlipProcessID[0],
                        volume2: detailInfo.Volume2[0],
                        volume3: detailInfo.Volume3[0],
                        volume4: detailInfo.Volume4[0],
                        otherPrice1: detailInfo.OtherPrice1[0],
                        otherPrice2: detailInfo.OtherPrice2[0],
                        otherPrice3: detailInfo.OtherPrice3[0],
                        otherPrice4: detailInfo.OtherPrice4[0],
                        packSlipProductId: detailInfo.PackSlipProductID[0],
                        packSlipBarcode: detailInfo.PackSlipBarcode[0]
                    }
    
                    // Add object to array
                    orderDetailsInfoArray.push(detailInfoObject)
                }
            }

            // Resolve promise with orderDetailsInfoArray
            resolve(orderDetailsInfoArray)
        })
    })

    // Get promises results
    Promise.all([orderInfoPromise, orderDetailInfoPromise]).then(function(results) {

        // Create order object
        var order = {
            orderId: orderId, 
            // dateCreated: '.CreatedDate',
            // dateModified: '.LastModifiedDate',
        }

        // Add data from promises to order object
        order.orderInfo = results[0]
        order.orderDetails = results[1]

        // Return order through callback
        callback(order)
    })
}
// Modules
var express = require('express')
var app = express()

var mustacheExpress = require('mustache-express')
var mongoose = require('mongoose')


// Mongoose Models
var Order = require('./models/order.js')


// Express Engine Config
app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'))


// Mongoose Connection
mongoose.connect('mongodb://157.230.40.86:27017/lilyanneintegration', {useNewUrlParser: true, authSource: 'admin', user: 'yeahgood', pass: 'beginnings01'})
var db = mongoose.connection


// Routes
app.get('/', function(req, res) {
    Order.find({}).sort({orderId: -1}).exec(function(err, orders) {
        if (err) {
            console.log(err)
        }

        res.render('index', {orders: orders})
    })
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
"use strict";

var express = require('express'),        // call express
    bodyParser = require('body-parser'),
    morgan = require('morgan'),            // log requests to the console (express4)
    expressValidator = require('express-validator'),
    multer = require('multer'),
    logger = require('./utils/logger'),
    cors = require('cors'),
    config = require('../config/database'),
    passport = require('passport'),
    mongoose = require('mongoose');

// pass passport for configuration
require('../config/passport')(passport);

var app = express();  // define our app using express

// *** mongoose *** ///
mongoose.connect(config.db[app.settings.env], function (err, res) {
    if (err) {
        logger.info('Error connecting to the database. ' + err);
    } else {
        logger.info('Connected to Database: ' + config.db[app.settings.env]);
    }
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
app.use(expressValidator()); // to validate requests

//CORS middleware
app.use(cors());

// Use the passport package in our application
app.use(passport.initialize());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// ================================================
// get an instance of the express Router
var router = express.Router(),
    doseRouter = require('./routers/dose_router'),
    gardenRouter = require('./routers/garden_router'),
    irrigationRouter = require('./routers/irrigation_router'),
    plantRouter = require('./routers/plant_router'),
    nutrientRouter = require('./routers/nutrient_router'),
    flavorRouter = require('./routers/flavor_router'),
    attributeRouter = require('./routers/attribute_router'),
    plagueRouter = require('./routers/plague_router'),
    sensorRouter = require('./routers/sensor_router'),
    userRouter = require('./routers/user_router'),
    authService = require('./services/auth_service');

// middleware to use for all requests in order to verify if the user is authorized
var isUserAuthenticated = function (req, res, next) {
    var token = req.headers.authorization;
    if (!token) {
        return res
            .status(403)
            .send({message: "Your request does not have header Authorization"});
    }
    authService.isUserAuthenticated(token, function (err) {
        if (err) {
            return res.status(403).send({message: 'Authentication failed. User not found.'});
        } else {
            next();
        }
    });
};

router.use('/dose', isUserAuthenticated, doseRouter);
router.use('/garden', isUserAuthenticated, gardenRouter);
router.use('/irrigation', isUserAuthenticated, irrigationRouter);
router.use('/plant', isUserAuthenticated, plantRouter);
router.use('/nutrient', nutrientRouter);
router.use('/sensor',  sensorRouter);
router.use('/user', userRouter);
router.use('/attribute', attributeRouter);
router.use('/plague', plagueRouter);
router.use('/flavor', flavorRouter);

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: ' Main page '});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

//static
console.log('process.cwd(): ' + process.cwd());
app.use(express.static(process.cwd() + '/public'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log(' Starting Server at port: ' + port);

module.exports = app;
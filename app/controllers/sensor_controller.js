/**
 * Created by igiagante on 28/9/15.
 */

var express = require('express');
var router = express.Router();
var sensorService = require('../services/sensor_service');

//process all data related to the sensors
var processDataSensor = function(req, res) {
    var sensors = req.body.sensors;
    sensorService.processData(sensors);
};

var test = function(req, res) {
    res.json(req.sensors);
};

module.exports = {
    processDataSensor : processDataSensor,
    test : test
};

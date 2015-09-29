/**
 * Created by igiagante on 28/9/15.
 */

var express = require('express');
var router = express.Router();
var sensorService = require('../services/sensor_service');

//process all data related to the sensors
var processDataSensor = function(req, res) {
    sensorService.processData(req.body.measures, function(error, result){
        if(error) res.json(error);

        console.log("result: " + result);

        res.json(result);
    });
};


var measures = function(req, res) {

    console.log("req: " + req.params.sensor_id);

    sensorService.getSensorMeasures(req.params.sensor_id, function(error, measures){
        if(error) res.json(error);
        res.json(measures);
    });
};

module.exports = {
    processDataSensor : processDataSensor,
    measures : measures
};

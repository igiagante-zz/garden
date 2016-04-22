/**
 * Created by igiagante on 28/9/15.
 */

"use strict";

var sensorService = require('../services/sensor_service');

//process all data related to the sensors
var processDataSensor = function(req, res) {
    sensorService.processData(req.body.measures, function(error, result){
        if(error) {
            res.json(error);
        }

        res.json(result);
    });
};


var measures = function(req, res) {

    console.log("req: " + req.params.sensor_id);

    sensorService.getSensorMeasures(req.params.sensor_id, function(error, measures){
        if(error) {
            res.json(error);
        }
        res.json(measures);
    });
};

module.exports = {
    processDataSensor : processDataSensor,
    measures : measures
};

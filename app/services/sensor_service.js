/**
 * Created by igiagante on 28/9/15.
 */

"use strict";

var Measure = require('../models/measure'),
    async = require('async');

var processSensor = function(measure, callback){

    Measure.create({
        measureDate: measure.measureDate,
        measure: measure.measure,
        unit: measure.unit,
        sensorId: measure.sensorId
    }, function(err) {
        if (err){
            callback(err);
        }
        callback();
    });
};

var processData = function(measures, callback){

    async.each(measures, processSensor, function(err){
        if (err) {
            callback(err);
        }
        callback(undefined, "all measures were successfully persisted!");
    });
};

//return all the measures done by one sensor
var getSensorMeasures = function(sensorId, callback) {

    Measure.find({ "sensorId" : sensorId }, function(error, measures){
        if(error) {
            callback(error);
        }
        callback(undefined, measures);
    });
};

module.exports = {
    processData : processData,
    getSensorMeasures : getSensorMeasures
};

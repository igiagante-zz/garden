/**
 * Created by igiagante on 28/9/15.
 */

var Sensor = require('../models/sensor'),
    Measure = require('../models/measure'),
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
        if (err) return callback(err);
        callback(null, "all measures were successfully persisted!");
    });
};

//return all the measures done by one sensor
var getSensorMeasuares = function(sensorId, callback) {

    Measure.find({ "sensorId" : sensorId }, function(error, measures){
        if(error) callback(error);
        callback(null, measures);
    });
};

module.exports = {
    processData : processData,
    getSensorMeasures : getSensorMeasuares
};

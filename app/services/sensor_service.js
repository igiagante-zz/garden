/**
 * Created by igiagante on 28/9/15.
 */

var Sensor = require('models/sensor');

var processSensor = function(sensor, callback){

    Sensor.create({
        id: sensor.id,
        name: sensor.name,
        measure: sensor.measure,
        unit: sensor.unit
    }, function(err) {
        if (err){
            callback(err);
        }
    });
};

var processData = function(sensors, callback){

    async.each(sensors, processSensor, function(err){
        if (err) return callback(err);
        callback(null, "all data persisted");
    });
};

module.exports = {
    processData : processData
};

/**
 * Created by igiagante on 28/9/15.
 */

"use strict";

var express = require('express'),
    router = express.Router(),
    sensorController = require('../controllers/sensor_controller');

//process sensor's data
router.post('/', sensorController.processDataSensor);

//get measures from one sensor
router.get('/measures/:sensor_id', sensorController.measures);

//get measures from one sensor
router.get('/', sensorController.getDataSensors);

module.exports = router;

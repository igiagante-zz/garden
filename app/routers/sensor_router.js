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

//get measures
router.get('/', sensorController.getDataSensors);

router.get('/actual', sensorController.getActualTempAndHumd);

module.exports = router;

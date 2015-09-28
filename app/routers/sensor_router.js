/**
 * Created by igiagante on 28/9/15.
 */

var express = require('express'),
    router = express.Router(),
    sensorController = require('../controllers/sensor_controller');

//process sensor's data
router.post('/', sensorController.processDataSensor);

//test connection
router.post('/test', sensorController.test);

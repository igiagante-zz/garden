/**
 * @author Ignacio Giagante, on 6/4/16.
 */

"use strict";

var express = require('express'),
    router = express.Router(),
    plagueController = require('../controllers/plague_controller');

//get all plagues
router.get('/', plagueController.getAll);

module.exports = router;

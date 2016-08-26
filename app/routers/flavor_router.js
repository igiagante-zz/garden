/**
 * Created by igiagante on 27/5/16.
 */

"use strict";

var express = require('express'),
    router = express.Router(),
    flavorController = require('../controllers/flavor_controller');

//get all flavors
router.get('/', flavorController.getAll);

module.exports = router;

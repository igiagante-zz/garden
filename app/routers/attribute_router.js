/**
 * @author Ignacio Giagante, on 3/6/16.
 */

"use strict";

var express = require('express'),
    router = express.Router(),
    attributeController = require('../controllers/attribute_controller');

//get all flavors
router.get('/', attributeController.getAll);

module.exports = router;
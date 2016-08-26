/**
 * @author Ignacio Giagante, on 3/6/16.
 */

"use strict";

var express = require('express'),
    router = express.Router(),
    attributeController = require('../controllers/attribute_controller');

//get all attributes
router.get('/', attributeController.getAll);

//get mock attributes
router.get('/mock', attributeController.getAttributesMock);

module.exports = router;
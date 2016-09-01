"use strict";

var express = require('express'),
    router = express.Router(),
    nutrientController = require('../controllers/nutrient_controller');

//create a nutrient
router.post('/', nutrientController.createNutrient);

//update a nutrient
router.put('/:nutrient_id', nutrientController.updateNutrient);
    
//retrieve one nutrient
router.get('/:nutrient_id', nutrientController.getNutrient);

//delete a nutrient
router.delete('/:nutrient_id', nutrientController.deleteNutrient);

//get all nutrients
router.get('/', nutrientController.getAll);

//get nutrients for one user
router.get('/user/:username', nutrientController.getNutrientsByUserName);

module.exports = router;
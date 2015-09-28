var express = require('express');
var router = express.Router(); 
var nutrientController = require('../controllers/nutrient_controller')

//create a nutrient
router.post('/', nutrientController.createNutrient);

//update a nutrient
router.put('/:nutrient_id', nutrientController.updateNutrient);
    
//retrieve one nutrient
router.get('/:nutrient_id', nutrientController.getPNutrient);

//delete a nutrient
router.delete('/:nutrient_id', nutrientController.deleteNutrient);

//get all nutrients
router.get('/', nutrientController.getAll);

module.exports = router;
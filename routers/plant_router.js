var express = require('express');
var router = express.Router(); 
var plantController = require('../controllers/plant_controller')

//create a plant
router.post('/', plantController.createPlant);

//update a plant
router.put('/:plant_id', plantController.updatePlant);
    
//retrieve one plant
router.get('/:plant_id', plantController.getPlant);

//delete a plant
router.delete('/:plant_id', plantController.deletePlant);

//get all plants
router.get('/', plantController.getAll);

module.exports = router;
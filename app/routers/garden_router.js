"use strict";

var express = require('express'),
    router = express.Router(),
    gardenController = require('../controllers/garden_controller');

//create a garden
router.post('/', gardenController.createGarden);

//update a garden
router.put('/:garden_id', gardenController.updateGarden);
    
//retrieve one garden
router.get('/:garden_id', gardenController.getGarden);

//get gardens for one user
router.get('/user/:username', gardenController.getGardensByUserName);

//delete a garden
router.delete('/:garden_id/:user_id', gardenController.deleteGarden);

//get all gardens
router.get('/', gardenController.getAll);

module.exports = router;
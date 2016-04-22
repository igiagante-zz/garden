"use strict";

var express = require('express'),
    router = express.Router(),
    doseController = require('../controllers/dose_controller');

//create a dose
router.post('/', doseController.createDose);

//update a dose
router.put('/:dose_id', doseController.updateDose);
    
//retrieve one dose
router.get('/:dose_id', doseController.getDose);

//delete a dose
router.delete('/:dose_id', doseController.deleteDose);

//get all dose
router.get('/', doseController.getAll);

module.exports = router;
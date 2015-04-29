var express = require('express');
var router = express.Router(); 
var dosisController = require('../controllers/dosis_controller')

//create a dosis
router.post('/', dosisController.createDosis);

//update a dosis
router.put('/:dosis_id', dosisController.updateDosis);
    
//retrieve one dosis
router.get('/:dosis_id', dosisController.getDosis);

//delete a dosis
router.delete('/:dosis_id', dosisController.deleteDosis);

//get all dosiss
router.get('/', dosisController.getAll);

module.exports = router;
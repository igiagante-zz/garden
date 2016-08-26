var express = require('express'),
    router = express.Router(),
    irrigationController = require('../controllers/irrigation_controller');

//create a irrigation
router.post('/', irrigationController.createIrrigation);
    
//retrieve one irrigation
router.get('/:irrigation_id', irrigationController.getIrrigation);

//delete a irrigation
router.delete('/:irrigation_id', irrigationController.deleteIrrigation);

//get all irrigations
router.get('/', irrigationController.getAll);

module.exports = router;





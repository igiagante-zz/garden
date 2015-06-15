var express = require('express');
var router = express.Router(); 
var imageController = require('../controllers/image_controller')

//get all images
router.get('/:plant_id', imageController.getImagesData);

//get main image
router.get('/:plant_id/main', imageController.getMainImage);

//add image to plant
router.post('/:plant_id', imageController.imagesProcess);

module.exports = router;
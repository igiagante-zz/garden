var express = require('express');
var router = express.Router(); 
var imageController = require('../controllers/image_controller')

//get all images
router.get('/:plant_id', imageController.getImages);

//get all image files
router.get('/files/:plant_id', imageController.getImageFiles);

//get main image for one plant
//router.get('/:plant_id', imageController.getMainImage);

//add image to plant
router.put('/:plant_id/:mainImage', imageController.addImage);

//add image to plant
router.post('/:plant_id', imageController.postImage);

//delete a plant
router.delete('/:plant_id', imageController.deleteImage);

module.exports = router;
var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    Images = require('../models/image'),
    imageService = require('../services/image_service'),
    logger = require('../utils/logger');

//Each plant has a main image to use like portrait in the gallery
var getMainImage = function(req, res) {
    
    imageService.mainImage(req.params.plant_id, function callback(error, image) {
        
        if(error) {
            return res.send(error).status(500);
        }
        res.json(image);
    }); 
};

var getImages = function(req, res) {       
    
    logger.info(' Trying to get all images from one plant with id ' + req.params.plant_id);

    req.assert('plant_id', 'plantId should not be empty', req.params.plant_id).notEmpty();

    var errors = req.validationErrors();
    
    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    imageService.getImagesData(req.params.plant_id, function callback(error, images) {
        
        if(error) {
            return res.send(error).status(500);
        }

        res.json({"files" : images});
    });
};

var getImageFiles = function(req, res) {       
    
    logger.info(' Trying to get all images from one plant with id ' + req.params.plant_id);

    req.assert('plant_id', 'plantId should not be empty', req.params.plant_id).notEmpty();

    var errors = req.validationErrors();
    
    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    imageService.imageFiles(req.params.plant_id, function callback(error, files) {
        
        if(error) {
            return res.send(error).status(500);
        }
        res.json(files);
    });
};

var addImage = function(req, res) {

    logger.info(' mainImage ' + req.params.mainImage);

    var folder = req.files.image.originalname.split('.')[0];

    imageService.upload(req.files.image, req.params.mainImage, folder, function callback(error, imageId) {
        
        if(error) {
            return res.send(error).status(500);
        }
        
        Plant.findById(req.params.plant_id, function(err, plant) {

            if (err) {                
                return res.send(err).status(500);
            }

            logger.info('adding images to array : ' + imageId)

            plant.images = plant.images.concat(imageId);

            // save the plant
            plant.save(function(err) {
                if (err) {                
                    return res.send(err).status(500);
                }
                res.json(plant);
            });
        });
    });
};

var deleteImage = function(req, res) {
        Images.remove({ 
            _id : req.params.image_id
        }, function(err, image) {
            if (err)
                res.send(err);
            
            logger.debug(' the image with id: ' + req.params.image_id + ' was deleted. ' );

            // get and return all the todos after you create another
            image.find(function(err, images) {
                if (err)
                    res.send(err)
                res.json(images);
            });
        });
    };

var postImage = function(req, res){

    console.log(req.files);
};

module.exports = {
    getMainImage: getMainImage,
    getImages: getImages,
    getImageFiles: getImageFiles,
    deleteImage : deleteImage,
    addImage: addImage,
    postImage: postImage
};





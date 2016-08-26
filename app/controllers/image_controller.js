var express = require('express'),
    imageService = require('../services/images_service'),
    logger = require('../utils/logger');

//Each plant has a main image to use like portrait in the gallery
var getMainImage = function(req, res) {
    
    imageService.getMainImage(req.params.plant_id, function callback(error, image) {
        
        if(error) {
            return res.send(error).status(500);
        }
        res.json(image);
    }); 
};

var setMainImage = function(req, res){

    var mainImageData = {};
    mainImageData.plantId = req.params.plantId;
    mainImageData.imageId = req.body.imageId;
    mainImageData.main = req.body.main;

    imageService.updateImage(mainImageData, function(err, data){
        res.json(data);
    });
};

var getImagesData = function(req, res) {       
    
    req.assert('plant_id', 'plantId should not be empty', req.params.plant_id).notEmpty();

    var errors = req.validationErrors();
    
    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    imageService.getImagesFilesData(req.params.plant_id, function callback(error, files) {

        for (var i = 0; i < files.length; i++) {
            if(files[i] !== undefined){
                files[i].url = 'http://localhost:3000' + files[i].url;
                files[i].thumbnailUrl = 'http://localhost:3000' + files[i].thumbnailUrl;
                files[i].deleteUrl = 'http://localhost:3000' + files[i].deleteUrl;
            }
        }
        
        if(error) {
            return res.send(error).status(500);
        }

        res.json({"files": files});
    });
};

var imagesProcess = function(req, res) {

    var plantId = req.params.plant_id;
    var fileKey = Object.keys(req.files)[0];
    var file = req.files[fileKey];

    req.assert('plant_id', 'plantId should not be empty', plantId).notEmpty();

    var errors = req.validationErrors();
    
    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    imageService.addImage(req.params.plant_id, file, function callback(error, files) {
        
        if(error) {
            return res.send(error).status(500);
        }
        res.json({"files" : [files]});
    });
};

var deleteImage = function(req, res) {

    var imageId = req.params.image_id;

    req.assert('image_id', 'ImageId should not be empty', imageId).notEmpty();

    var errors = req.validationErrors();
    
    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    imageService.deleteImageProcess(imageId, function(files){
        res.json({"files" : [files]});
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

module.exports = {
    getMainImage: getMainImage,
    getImagesData : getImagesData,
    deleteImage : deleteImage,
    imagesProcess: imagesProcess
};





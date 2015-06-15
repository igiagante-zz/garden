var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    Images = require('../models/image'),
    imageService = require('../services/image_service'),
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
    
    logger.info(' Trying to get all images from one plant with id ' + req.params.plant_id);

    req.assert('plant_id', 'plantId should not be empty', req.params.plant_id).notEmpty();

    var errors = req.validationErrors();
    
    if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
    }

    imageService.getImagesFilesData(req.params.plant_id, function callback(error, images) {
        
        if(error) {
            return res.send(error).status(500);
        }

        res.json({"files" : images});
    });
};

var imagesProcess = function(req, res) {

    var files = req.body.files;

    console.log('files : ' + files);

    imageService.imagesProcess(files, function callback(error, images) {
        
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

module.exports = {
    getMainImage: getMainImage,
    getImagesData : getImagesData,
    imagesProcess: imagesProcess
};





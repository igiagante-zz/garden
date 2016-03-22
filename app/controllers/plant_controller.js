var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    Garden = require('../models/garden'),
    logger = require('../utils/logger'),
    imageService = require('../services/images_service_new'),
    util = require('util');


/**
 * Persist each image in the folder's plant
 * @param folderName
 * @param files
 * @param callback
 */
var persistImageFiles = function(folderName, files, callback) {
    for(var file in files) {
        imageService.persistImageFile(folderName, file, callback);
    }
};

/**
 * Create a plant
 * @param req request parameters
 * @param res response
 */
var createPlant = function(req, res) {       

    logger.debug(' -------------------- Create a new plant  -------------------- ');

    //req.assert('gardenId', 'Invalid gardenId').notEmpty();
    req.assert('gardenId', 'gardenId should not be empty', req.body.gardenId).notEmpty();

    var errors = req.validationErrors();
      if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
      }

    var imagesData;

    if(req.files !== null) {
        imagesData = imageService.getImageData(req.files);
    }

    Garden.findById(req.body.gardenId, function(err){

        if(err)
            res.send(err);

        Plant.create({
            name: req.body.name,  
            size: req.body.size,
            phSoil: req.body.phSoil,
            ecSoil: req.body.ecSoil,
            harvest: req.body.harvest,
            gardenId: req.body.gardenId,
            images: imagesData
        }, function(err) {
            if (err)
                res.send(err);

            var namePlant = req.body.name;

            //persist images for one plant
            persistImageFiles(namePlant, req.files, function(err, result) {
                if(err)
                    logger.debug(' One image could not be saved ' + err);
                logger.debug(' the image was persisted successfully ' + result);
            });
            
            // get and return all the plants after you create another
            Plant.find(function(err, plants) {
                if (err)
                    res.send(err);
                res.json(plants);
            });
        }); 
    });
};

/**
 * Delete one or more image in the folder's plant
 * @param folderName
 * @param imagesData
 * @param callback
 */
var deleteImageFiles = function(folderName, imagesData, callback) {
    for(var image in imagesData) {
        imageService.deleteImageFile(folderName, image.name, callback);
    }
};

/**
 * Update a plant
 * @param req
 * @param res
 */
var updatePlant = function(req, res) {

    var imagesData;

    if(req.files !== undefined) {
        imagesData = imageService.getImageData(req.files);
    }

    logger.debug(' -------------------- Update a plant  -------------------- ');

    logger.info(imagesData);

    Plant.findById(req.params.plant_id, function(err, plant) {

        if (err)
            res.send(err);

        plant.name = req.body.name; 
        plant.size = req.body.size;
        plant.phSoil = req.body.phSoil;
        plant.ecSoil = req.body.ecSoil;
        plant.harvest = req.body.harvest;
        plant.irrigations = req.body.irrigations;
        plant.gardenId = req.body.gardenId;
        plant.images = imagesData;

        var imagesToBeDelete = imageService.verifyIfImagesShouldBeDeleted(plant.images, imagesData);

        // save the plant
        plant.save(function(err) {
            if (err)
                res.send(err);

            //delete images for one plant
            deleteImageFiles(req.body.name, imagesToBeDelete, function(err, result) {
                if(err)
                    logger.debug(' One image could not be deleted ' + err);
                logger.debug(' the image was deleted successfully ' + result);
            });

            res.json(plant);
        });
    });
};

/**
 * Delete a plant
 * @param req
 * @param res
 */
var deletePlant = function(req, res) {
        Plant.remove({ 
            _id : req.params.plant_id 
        }, function(err, plant) {
            if (err)
                res.send(err);
            
            logger.debug(' the plant with id: ' + req.params.plant_id + ' was deleted. ' );

            // get and return all the todos after you create another
            plant.find(function(err, plants) {
                if (err)
                    res.send(err);
                res.json(plants);
            });
        });
    };

/**
 * Get a plant
 * @param req
 * @param res
 */
var getPlant = function(req, res) {
    Plant.findById(req.params.plant_id, function(err, plant) {
        if (err)
            res.send(err);
        res.json(plant);
    });
};

/**
 * Get all the plants
 * @param req
 * @param res
 */
var getAll = function(req, res) {       
    Plant.find(function(err, plants) {
        if (err)
            res.send(err);
        res.json(plants);
    });
};

/**
 * Get all the plants for one garden
 * @param req
 * @param res
 */
var getAllThePlantsForOneGarden = function(req, res) {

    Plant.find({gardenId : req.body.gardenId}, function(err, plants){
        if (err)
            res.send(err);
        res.json(plants);
    });
};

module.exports = {
    createPlant: createPlant,
    updatePlant: updatePlant,
    deletePlant: deletePlant,
    getPlant: getPlant,
    getAll: getAll,
    getAllThePlantsForOneGarden: getAllThePlantsForOneGarden
};





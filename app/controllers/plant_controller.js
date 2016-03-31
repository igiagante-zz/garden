var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    Garden = require('../models/garden'),
    logger = require('../utils/logger'),
    imageService = require('../services/images_service_new'),
    util = require('util'),
    async = require('async'),
    _ = require('lodash');


/**
 * Persist each image in the folder's plant
 * @param folderName
 * @param files
 * @param callback
 */
var persistImageFiles = function(folderName, files, callback) {

    // Object.keys
    var keys = Object.keys(files);

    for (var i = 0; i < keys.length; ++i) {
        var file = files[keys[i]];
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
    var plantName = req.body.name;

    if(req.files !== null) {
        imagesData = imageService.getImageData(plantName, req.files, true);
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

            //persist images for one plant
            persistImageFiles(plantName, req.files, function(err, result) {
                if(err)
                    logger.debug(' One image could not be saved ' + err);
                logger.debug(' the image was persisted successfully ' + result);

                res.json(req.body);
            });

        }); 
    });
};

/**
 * Delete one or more image (file) in the folder's plant
 * @param folderName
 * @param files
 * @param callback
 */
var deleteImageFiles = function(folderName, files, callback) {

    if(_.isEmpty(files)){
        return callback(undefined);
    }

    // Object.keys
    var keys = Object.keys(files);

    for (var i = 0; i < keys.length; ++i) {
        var image = files[keys[i]];
        imageService.deleteImageFile(folderName, image.name, callback);
    }
};

/** ------------------------------ Update Plant Flow ------------------------------------------ **/

/**
 * Persist images for one plant.
 * @param plantName the plant name
 * @param files the files to be persisted
 * @param callback
 */
var persistImages = function(plantName, files, callback){
    persistImageFiles(plantName, files, function(err, result) {
        if(err){
            logger.debug(' One image could not be saved ' + err);
            return callback(err);
        }
        logger.debug(' the image was persisted successfully ' + result);
        callback(undefined, result);
    });
};

/**
 * Verify if there are some images to be deleted.
 * @param imagesFromDB images data obtained from database
 * @param imagesFromRequest images data obtained from request
 * @param callback
 */
var getImagesToBeDelete = function(imagesFromDB, imagesFromRequest, callback){
    imageService.verifyIfImagesShouldBeDeleted(imagesFromDB, imagesFromRequest, callback);
};

/**
 * Delete file images for one plant.
 * @param plantName the name of the plant
 * @param callback callback for the async auto
 * @param results results obtained from the last function in async
 */
var deleteImages = function(plantName, callback, results){
    //delete images for one plant
    deleteImageFiles(plantName, results.getImagesToBeDelete, function(err, result) {
        if(err){
            logger.debug(' One image could not be deleted ' + err);
            return callback(err);
        }
        logger.debug(' the image was deleted successfully ' + result);
        callback(undefined, result);
    });
};

/**
 * Update a plant
 * @param req
 * @param res
 */
var updatePlant = function(req, res) {

    var plantName = req.body.name;

    logger.debug(' -------------------- Update a plant  -------------------- ');

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

        var imagesFromDB = JSON.parse(JSON.stringify(plant.images));

        //Get images data from files sent through the request
        imageService.getImageData(plantName, req.files, true, req.body.main, function(err, imagesData) {

            var flow = {
                persistImages: async.apply(persistImages, plantName, req.files),
                getImagesToBeDelete: async.apply(getImagesToBeDelete, imagesFromDB, imagesData),
                deleteImages: ['getImagesToBeDelete', async.apply(deleteImages, plantName)],
                savePlant: ['persistImages', 'deleteImages', function (callback) {

                    plant.images = imagesData;

                    logger.debug('images: ' + JSON.parse(JSON.stringify(plant.images)));

                    plant.save(function (err) {
                        callback(err, plant);
                    });

                    callback(undefined, plant);
                }]
            };

            async.auto(flow, function (error, results) {
                if(error) {
                    return res.send(error);
                }
                res.send(plant);
            });
        });
    });
};

/** ------------------------------ Update Plant Flow Finish ------------------------------------------ **/

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





var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    Garden = require('../models/garden'),
    logger = require('../utils/logger'),
    imageService = require('../services/images_service'),
    util = require('util'),
    _ = require('lodash');


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
        imageService.getImageData(plantName, req.files, true, req.body.main, function(err, data){
            imagesData = data;
        });
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
            imageService.persistImageFiles(plantName, req.files, function(err, result) {
                if(err)
                    logger.debug(' One image could not be saved ' + err);
                logger.debug(' the image was persisted successfully ' + result);

                res.json(req.body);
            });

        }); 
    });
};

/** ------------------------------ Update Plant Flow ------------------------------------------ **/

/**
 * Update a plant
 * @param req
 * @param res
 */
var updatePlant = function(req, res) {

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

        //convert model to json and then to Array
        var imagesFromDB = JSON.parse(JSON.stringify(plant.images));

        //Get images data from files sent through the request
        imageService.getImageData(plant.name, req.files, req.body.main, function(err, imagesData) {

            //Update images for one plant
            imageService.processImageUpdate(req.files, imagesData, imagesFromDB, plant, plant.name, function(err, result) {
                if(err) {
                    return res.send(err);
                }
                res.send(result);
            });
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





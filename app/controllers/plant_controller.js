var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    Garden = require('../models/garden'),
    logger = require('../utils/logger'),
    util = require('util');

var createPlant = function(req, res) {       

    logger.debug(' -------------------- Creating a new plant  -------------------- ');

    //req.assert('gardenId', 'Invalid gardenId').notEmpty();
    req.assert('gardenId', 'gardenId should not be empty', req.body.gardenId).notEmpty();

    var errors = req.validationErrors();
      if (errors) {
        res.status(400).send('There have been validation errors: ' + util.inspect(errors));
        return;
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
            gardenId: req.body.gardenId
        }, function(err) {
            if (err)
                res.send(err);
            
            // get and return all the plants after you create another
            Plant.find(function(err, plants) {
                if (err)
                    res.send(err)
                res.json(plants);
            });
        }); 
    });  
           
};

var updatePlant = function(req, res) {

    logger.debug(' -------------------- Updating a plant  -------------------- ');

    Plant.findById(req.params.plant_id, function(err, plant) {

        if (err)
            res.send(err);

        logger.info(plant);

        plant.name = req.body.name; 
        plant.size = req.body.size;
        plant.phSoil = req.body.phSoil;
        plant.ecSoil = req.body.ecSoil;
        plant.harvest = req.body.harvest;
        plant.irrigations = req.body.irrigations
        plant.gardenId = req.body.gardenId;

        // save the plant
        plant.save(function(err) {
            if (err)
                res.send(err);
            res.json(plant);
        });
    });
};

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
                    res.send(err)
                res.json(plants);
            });
        });
    };

var getPlant = function(req, res) {
        Plant.findById(req.params.plant_id, function(err, plant) {
            if (err)
                res.send(err);
            res.json(plant);
        });
    };

var getAll = function(req, res) {       
    Plant.find(function(err, plants) {
        if (err)
            res.send(err)
        res.json(plants);
    });
};

module.exports = {
    createPlant: createPlant,
    updatePlant: updatePlant,
    deletePlant: deletePlant,
    getPlant: getPlant,
    getAll: getAll
};





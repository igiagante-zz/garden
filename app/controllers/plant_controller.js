"use strict";

var Plant = require('../models/plant'),
    Garden = require('../models/garden'),
    logger = require('../utils/logger'),
    imageService = require('../services/images_service'),
    plantService = require('../services/plant_service'),
    util = require('util'),
    utilObject = require('../commons/util_object'),
    utilImage = require('../commons/util_image');

/**
 * Create a plant
 * @param req request parameters
 * @param res response
 */
var createPlant = function (req, res) {

    //req.assert('gardenId', 'Invalid gardenId').notEmpty();
    req.assert('gardenId', 'gardenId should not be empty', req.body.gardenId).notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send('There have been validation errors: ' + util.inspect(errors));
    }

    var imagesData;
    var plantName = req.body.name;

    plantService.getPlantInfoByName(req.body.name, function (err, plant) {

        // Verify that any plant exits with this name
        if (plant !== null && plant.length > 0) {
            logger.debug('  The name of the plant already exists. Try other please!  ');
            //return res.status(409).send(' The name of the plant already exists. Try other please! ');
        }

        logger.debug(' -------------------- Creating a new plant  -------------------- ');

        if (req.files !== null) {
            imageService.getImageData(plantName, req.files, req.body.mainImage, function (err, data) {
                imagesData = data;
            });
        }

        // TODO - Refactor
        plantService.convertIds(req.body, function (flavors, attributes, plagues) {

            Garden.findById(req.body.gardenId, function (err) {

                if (err) {
                    return res.send(err);
                }

                Plant.create({
                    name: req.body.name,
                    size: req.body.size,
                    phSoil: req.body.phSoil,
                    ecSoil: req.body.ecSoil,
                    harvest: req.body.harvest,
                    gardenId: req.body.gardenId,
                    genotype: req.body.genotype,
                    floweringTime: req.body.floweringTime,
                    description: req.body.description,
                    images: imagesData,
                    flavors: flavors,
                    attributes: attributes,
                    plagues: plagues
                }, function (err, plant) {
                    if (err) {
                        res.send(err);
                    }

                    //persist images for one plant
                    imageService.createProcessImageFiles(plantName, req.files, function (err) {
                        if (err) {
                            return res.send(' There was an error trying to persist a plant ' + err);
                        }
                        logger.debug(' the plant was persisted successfully ');

                        plantService.convertIdsFromMongo(plant, function () {
                            plantService.getResourcesIdsImagesForPlant(plant._doc.id, function (err, resourcesIds) {
                                if (err) {
                                    return callback(err);
                                }
                                plant.resourcesIds = resourcesIds;
                                logger.debug(' Plant created : \n' + plant);
                                return res.json(plant);
                            });
                        });
                    });
                });
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
var updatePlant = function (req, res) {

    logger.debug(' -------------------- Update a plant  -------------------- ');

    Plant.findById(req.params.plant_id, function (err, plant) {

        if (err) {
            return res.send(err);
        }

        if (plant === null) {
            logger.debug('  The plant does not exist!  ');
            return res.status(400).send(' The plant does not exist ');
        }

        var oldFolderName = false;

        //If the name of the plant(Model) changes, the folder's image path should be updated.
        if (plant.name !== req.body.name) {
            oldFolderName = plant.name;
        }

        if (req.body.name) {
            plant.name = req.body.name;
        }

        if (req.body.size) {
            plant.size = req.body.size;
        }

        if (req.body.phSoil) {
            plant.phSoil = req.body.phSoil;
        }

        if (req.body.ecSoil) {
            plant.ecSoil = req.body.ecSoil;
        }

        if (req.body.harvest) {
            plant.harvest = req.body.harvest;
        }

        if (req.body.genotype) {
            plant.genotype = req.body.genotype;
        }

        if (req.body.floweringTime) {
            plant.floweringTime = req.body.floweringTime;
        }

        if (req.body.description) {
            plant.description = req.body.description;
        }

        if (req.body.resourcesIds) {
            plant.resourcesIds = JSON.parse(req.body.resourcesIds);
        }

        // TODO - Refactor
        plantService.convertIds(req.body, function (flavors, attributes, plagues) {

            plant.flavors = flavors;

            plant.attributes = attributes;

            plant.plagues = plagues;

            plant.gardenId = req.body.gardenId;

            //Update images for one plant
            imageService.processImageUpdate(req, plant, oldFolderName, function (err) {
                if (err) {
                    return res.send(err);
                }

                // After images have been processed, let's update de plant's document
                plant.save(function (err, plant) {
                    if (err) {
                        return res.send(err);
                    }

                    plantService.convertIdsFromMongo(plant, function () {
                        plantService.getResourcesIdsImagesForPlant(plant._doc.id, function (err, resourcesIds) {
                            if (err) {
                                return callback(err);
                            }
                            plant._doc.resourcesIds = resourcesIds;
                            logger.debug(' Plant updated : \n' + plant);
                            return res.json(plant);
                        });
                    });
                });
            });
        });
    });
};

/**
 * Delete a plant
 * @param req
 * @param res
 */
var deletePlant = function (req, res) {

    Plant.findById(req.params.plant_id, function (err, plant) {

        if (err) {
            return res.status(500).send(err.name + ': ' + err.message);
        }

        if (plant === null) {
            logger.debug('  The plant does not exist!  ');
            return res.status(400).send(' The plant does not exist ');
        }

        Plant.remove({
            _id: req.params.plant_id
        }, function (err) {

            if (err) {
                return res.status(404).send(err);
            }

            var text = ' The plant with id ' + req.params.plant_id + ' was deleted. ';
            logger.debug(text);
            var data = {
                message: text
            };

            imageService.deleteFolderImage(plant.name, function (error) {
                if (error) {
                    return res.status(400).send(' The images folder could not be deleted. ');
                }
                return res.status(202).send(data);
            });
        });
    });
};

/**
 * Get a plant
 * @param req
 * @param res
 */
var getPlant = function (req, res) {

    logger.debug(' Get plant with id: ' + req.params.plant_id);

    Plant.findById(req.params.plant_id, function (err, plant) {
        if (err) {
            return res.send(err);
        }

        utilObject.convertItemId(plant, function () {
            return res.json(plant);
        });
    });
};

/**
 * Get all the plants
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Plant.find(function (err, plants) {
        if (err) {
            return res.send(err);
        }
        plantService.convertPlantsIdsFromMongo(plants, function () {
            return res.send(plants);
        });
    });
};

/**
 * Get all the plants for one garden
 * @param req
 * @param res
 */
var getAllThePlantsForOneGarden = function (req, res) {

    Plant.find({gardenId: req.body.gardenId}, function (err, plants) {
        if (err) {
            res.send(err);
        }
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





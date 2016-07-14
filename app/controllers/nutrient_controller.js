"use strict";

var imageService = require('../services/images_service'),
    logger = require('../utils/logger'),
    nutrientService = require('../services/nutrient_service'),
    Nutrient = require('../models/nutrient'),
    utilObject = require('../commons/util_object');

/**
 * Create one nutrient
 * @param req
 * @param res
 */
var createNutrient = function (req, res) {

    var imagesData = null;
    var nutrientName = req.body.name;

    nutrientService.getNutrientInfoByName(nutrientName, function (err, nutrient) {

        // Verify that any nutrient exits with this name
        if (nutrient !== null && nutrient.length > 0) {
            logger.debug('  The name of the nutrient already exists. Try other please!  ');
            return res.status(409).send(' The name of the nutrient already exists. Try other please! ');
        }

        logger.debug(' -------------------- Creating a new nutrient  -------------------- ');

        if (req.files !== null) {
            imageService.getImageData(nutrientName, req.files, req.body.main, function (err, data) {
                imagesData = data;
            });
        }

        Nutrient.create({
            name: req.body.name,
            ph: req.body.ph,
            npk: req.body.npk,
            description: req.body.description,
            images: imagesData
        }, function (err, nutrient) {
            if (err) {
                res.send(err);
            }

            //persist images for one nutrient
            imageService.createProcessImageFiles(nutrientName, req.files, function (err) {
                if (err) {
                    return res.send(' There was an error trying to persist a nutrient ' + err);
                }
                logger.debug(' the nutrient was persisted successfully ');

                nutrientService.getNutrient(nutrient, function (err, nutrient) {
                    if (err) {
                        return callback(err);
                    }
                    logger.debug(' Nutrient created : \n' + nutrient);
                    return res.json(nutrient);
                });
            });
        });
    });
};

/**
 * Update one nutrient
 * @param req
 * @param res
 */
var updateNutrient = function (req, res) {

    Nutrient.findById(req.params.nutrient_id, function (err, nutrient) {

        if (err) {
            return res.send(err);
        }

        if (nutrient === null) {
            logger.debug('  The nutrient does not exist!  ');
            return res.status(400).send(' The nutrient does not exist ');
        }

        var oldFolderName = false;

        //If the name of the nutrient(Model) changes, the folder's image path should be updated.
        var nutrientName = nutrient.name;
        if (nutrientName !== req.body.name) {
            oldFolderName = nutrientName;
        }

        if (req.body.resourcesIds) {
            nutrient.resourcesIds = JSON.parse(req.body.resourcesIds);
        }

        nutrient.name = req.body.name;
        nutrient.ph = req.body.ph;
        nutrient.npk = req.body.npk;
        nutrient.description = req.body.description;

        //Update images for one nutrient
        imageService.processImageUpdate(req, nutrient, oldFolderName, function (err) {
            if (err) {
                return res.send(err);
            }

            // After images have been processed, let's update de nutrient's document
            nutrient.save(function (err, nutrient) {
                if (err) {
                    return res.send(err);
                }

                nutrientService.getNutrient(nutrient, function (err, nutrient) {
                    if (err) {
                        return callback(err);
                    }
                    logger.debug(' Nutrient updated : \n' + nutrient);
                    return res.json(nutrient);
                });
            });
        });
    });
};

//retrieve one nutrient
var getNutrient = function (req, res) {
    Nutrient.findById(req.params.nutrient_id, function (err, nutrient) {
        if (err) {
            res.send(err);
        }
        res.json(nutrient);
    });
};

//delete a nutrient
var deleteNutrient = function (req, res) {
    Nutrient.remove({
        _id: req.params.nutrient_id
    }, function (err) {
        if (err) {
            res.send(err);
        }

        // get and return all the todos after you create another
        Nutrient.find(function (err, nutrients) {
            if (err) {
                res.send(err);
            }
            res.json(nutrients);
        });
    });
};

//get all nutrients
var getAll = function (req, res) {
    Nutrient.find(function (err, nutrients) {
        if (err) {
            res.send(err);
        }
        res.json(nutrients);
    });
};

module.exports = {
    createNutrient: createNutrient,
    updateNutrient: updateNutrient,
    deleteNutrient: deleteNutrient,
    getNutrient: getNutrient,
    getAll: getAll
};





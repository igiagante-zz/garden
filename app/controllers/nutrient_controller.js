"use strict";

var imageService = require('../services/images_service'),
    logger = require('../utils/logger'),
    nutrientService = require('../services/nutrient_service'),
    utilImage = require('../commons/util_image'),
    utilObject = require('../commons/util_object'),
    User = require('../models/user'),
    Nutrient = require('../models/nutrient');

var userNotFound = 'USER_NOT_FOUND';

/**
 * Create one nutrient
 * @param req
 * @param res
 */
var createNutrient = function (req, res) {

    var imagesData = null;
    var userId = req.body.userId;
    var nutrientName = req.body.name;

    nutrientService.getNutrientInfoByName(nutrientName, function (err, nutrient) {

        // Verify that any nutrient exits with this name
        if (nutrient !== null && nutrient.length > 0) {
            logger.debug('  The name of the nutrient already exists. Try other please!  ');
            //return res.status(409).send(' The name of the nutrient already exists. Try other please! ');
        }

        logger.debug(' -------------------- Creating a new nutrient  -------------------- ');

        if (req.files !== null) {
            imageService.getImageData(nutrientName, req.files, req.body.mainImage, function (err, data) {
                imagesData = data;
            });
        }

        Nutrient.create({
            userId: userId,
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
            return res.send(err);
        }
        return res.json(nutrient);
    });
};

//delete a nutrient
var deleteNutrient = function (req, res) {

    Nutrient.findById(req.params.nutrient_id, function (err, nutrient) {

        if (err) {
            return res.status(500).send(err.name + ': ' + err.message);
        }

        if (nutrient === null) {
            logger.debug('  The nutrient does not exist!  ');
            return res.status(400).send(' The nutrient does not exist ');
        }

        Nutrient.remove({
            _id: req.params.nutrient_id
        }, function (err) {

            if (err) {
                return res.status(404).send(err);
            }

            var text = ' The nutrient with id ' + req.params.nutrient_id + ' was deleted. ';
            logger.debug(text);
            var data = {
                message: text
            };

            imageService.deleteFolderImage(nutrient.name, function (error) {
                if (error) {
                    return res.status(400).send(' The images folder could not be deleted. ');
                }
                return res.status(202).send(data);
            });
        });
    });
};

//get all nutrients
var getAll = function (req, res) {

    Nutrient.find(function (err, nutrients) {
        if (err) {
            return res.send(err);
        }
        utilObject.convertItemsId(nutrients, function () {
            nutrientService.convertIdsFromMongo(nutrients, function () {
                return res.json(nutrients);
            });
        });
    });
};

/**
 * Get the nutrients for one user
 * @param req
 * @param res
 */
var getNutrientsByUserName = function (req, res) {

    User.findOne({
        name: req.params.username
    }, function (err, user) {
        if (err) {
            return res.status(505).send(err);
        }
        if (!user) {
            return res.status(404).send({message: userNotFound});
        } else {

            nutrientService.getNutrientsByUserId(user._doc._id, function (err, nutrients) {
                if (err) {
                    return res.status(505).send(err);
                }
                return res.status(200).json(nutrients);
            });
        }
    });
};

module.exports = {
    createNutrient: createNutrient,
    updateNutrient: updateNutrient,
    deleteNutrient: deleteNutrient,
    getNutrient: getNutrient,
    getAll: getAll,
    getNutrientsByUserName: getNutrientsByUserName
};





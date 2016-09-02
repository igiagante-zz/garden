"use strict";

var Garden = require('../models/garden'),
    User = require('../models/user'),
    userService = require('../services/user_service'),
    logger = require('../utils/logger'),
    utilObject = require('../commons/util_object'),
    gardenService = require('../../app/services/garden_service');

var userNotFound = 'USER_NOT_FOUND';

/**
 * Create a garden
 * @param req
 * @param res
 */
var createGarden = function (req, res) {

    var userId = req.body.userId;
    var gardenName = req.body.name;

    Garden.create({
        userId: userId,
        name: gardenName
    }, function (err, garden) {
        if (err) {
            return res.status(500).send(err);
        }

        userService.addGardenIdToUser(userId, garden._doc._id, function (err, user) {
            if (err) {
                return res.status(500).send(err);
            }

            utilObject.convertItemId(garden, function () {
                return res.json(garden);
            });
        });
    });
};

/**
 * Update a garden
 * @param req
 * @param res
 */
var updateGarden = function (req, res) {

    Garden.findById(req.params.garden_id, function (err, garden) {

        if (err) {
            res.send(err);
        }

        garden.userId = req.body.userId;
        garden.name = req.body.name;
        garden.startDate = req.body.startDate;
        garden.endDate = req.body.endDate;
        // save the garden
        garden.save(function (err, garden) {
            if (err) {
                return res.send(err);
            }

            utilObject.convertItemId(garden, function () {

                gardenService.getGarden(garden._doc.id, function (err, garden) {
                    if(err) {
                        return res.status(500).send(err);
                    }
                    return res.status(200).send(garden);
                });
            });
        });
    });
};

/**
 * Get a garden
 * @param req
 * @param res
 */
var getGarden = function (req, res) {

    var gardenId = req.params.garden_id;

    gardenService.getGarden(gardenId, function (err, garden) {
       if(err) {
           return res.status(500).send(err);
       }
        return res.status(200).send(garden);
    });
};

/**
 * Delete a garden
 * @param req
 * @param res
 */
var deleteGarden = function (req, res) {

    var userId = req.params.user_id;
    var gardenId = req.params.garden_id;

    Garden.remove({
        _id: gardenId
    }, function (err) {

        if (err) {
            return res.status(404).send(err);
        }

        var text = ' The garden with id ' + gardenId + ' was deleted. ';
        logger.debug(text);

        var data = {
            message: text
        };

        userService.removeGardenIdFromUser(userId, gardenId, function (err, user) {
            if (err) {
                return res.status(500).send(err);
            }

            return res.status(202).send(data);
        });
    });
};

/**
 * Get all the gardens
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Garden.find(function (err, gardens) {
        if (err) {
            res.send(err);
        }
        utilObject.convertItemsId(gardens, function () {

            gardenService.addIrrigationsToGardens(gardens, function (err) {
                if (err) {
                    return res.status(500).send(err);
                }

                gardenService.addPlantsToGardens(gardens, function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    return res.json(gardens);
                });
            });
        });
    });
};

/**
 * Get the gardens for one user
 * @param req
 * @param res
 */
var getGardensByUserName = function (req, res) {
    User.findOne({
        name: req.params.username
    }, function (err, user) {
        if (err) {
            return res.status(505).send(err);
        }
        if (!user) {
            return res.status(404).send({message: userNotFound});
        } else {
            gardenService.getGardensData(user._doc.gardensIds, function (err, gardens) {
                if (err) {
                    return res.status(505).send(err);
                }
                return res.status(200).json(gardens);
            });
        }
    });
};

module.exports = {
    createGarden: createGarden,
    updateGarden: updateGarden,
    deleteGarden: deleteGarden,
    getGarden: getGarden,
    getAll: getAll,
    getGardensByUserName: getGardensByUserName
};
"use strict";

var Garden = require('../models/garden'),
    logger = require('../utils/logger'),
    utilObject = require('../commons/util_object'),
    PlantService = require('../../app/services/plant_service'),
    gardenService = require('../../app/services/garden_service');

/**
 * Create a garden
 * @param req
 * @param res
 */
var createGarden = function (req, res) {

    Garden.create({
        name: req.body.name
    }, function (err, garden) {
        if (err) {
            res.send(err);
        }
        utilObject.convertItemId(garden, function () {
            return res.json(garden);
        });
    });
};

/**
 * Update a garden
 * @param req
 * @param res
 */
var updateGarden = function (req, res) {

    console.log(req.params);

    Garden.findById(req.params.garden_id, function (err, garden) {

        if (err) {
            res.send(err);
        }

        garden.name = req.body.name;
        garden.startDate = req.body.startDate;
        garden.endDate = req.body.endDate;
        // save the garden
        garden.save(function (err, garden) {
            if (err) {
                return res.send(err);
            }
            utilObject.convertItemId(garden, function () {
                return res.json(garden);
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
    Garden.findById(req.params.garden_id, function (err, garden) {
        if (err) {
            res.send(err);
        }
        utilObject.convertItemId(garden, function () {
            PlantService.getPlantsByGardenId(garden._doc.id, function (err, plants) {
                if(err) {
                    return res.send(err);
                }
                garden._doc.plants = plants;
                return res.json(garden);
            });
        });
    });
};

/**
 * Delete a garden
 * @param req
 * @param res
 */
var deleteGarden = function (req, res) {
    Garden.remove({
        _id: req.params.garden_id
    }, function (err) {

        if (err) {
            return res.status(404).send(err);
        }
        var text = ' The garden with id ' + req.params.garden_id + ' was deleted. ';
        logger.debug(text);
        var data = {
            message: text
        };
        return res.status(202).send(data);
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
            gardenService.addPlantsToGardens(gardens, function(err) {
                if(err) {
                    return res.status(404).send(err);
                }
                return res.json(gardens);
            });
        });
    });
};

module.exports = {
    createGarden: createGarden,
    updateGarden: updateGarden,
    deleteGarden: deleteGarden,
    getGarden: getGarden,
    getAll: getAll
};
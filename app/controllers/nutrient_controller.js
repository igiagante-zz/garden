"use strict";

var imageService = require('../services/images_service'),
    logger = require('../utils/logger'),
    Nutrient = require('../models/nutrient');

/**
 * Create one nutrient
 * @param req
 * @param res
 */
var createNutrient = function (req, res) {

    var imagesData = null;
    var nutrientName = req.body.name;

    if (req.files !== null) {
        imageService.getImageData(nutrientName, req.files, req.body.main, function (err, data) {
            imagesData = data;
        });
    }

    Nutrient.create({
        name: req.body.name,
        ph: req.body.quantity,
        npk: req.body.npk,
        description: req.body.description,
        images: imagesData
    }, function (err, nutrient) {
        if (err) {
            res.send(err);
        }

        //persist images for one plant
        imageService.persistImageFiles(nutrient.name, req.files, function (err) {
            if (err) {
                return res.send(err);
            }
            res.json(nutrient);
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
            res.send(err);
        }

        logger.info(nutrient);

        nutrient.name = req.body.name;
        nutrient.ph = req.body.ph;
        nutrient.npk = req.body.npk;
        nutrient.description = req.body.description;

        imageService.processImageUpdate(req, nutrient, function (err, result) {
            if (err) {
                res.send(err);
            }
            res.json(result);
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





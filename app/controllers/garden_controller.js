"use strict";

var Garden = require('../models/garden');

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

        res.json(garden);
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
                res.send(err);
            }
            res.json(garden);
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
        res.json(garden);
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
            res.send(err);
        }

        // get and return all the todos after you create another
        Garden.find(function (err, gardens) {
            if (err) {
                res.send(err);
            }
            res.json(gardens);
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
        res.json(gardens);
    });
};

module.exports = {
    createGarden: createGarden,
    updateGarden: updateGarden,
    deleteGarden: deleteGarden,
    getGarden: getGarden,
    getAll: getAll
};
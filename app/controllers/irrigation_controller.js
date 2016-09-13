"use strict";

var Irrigation = require('../models/irrigation'),
    Dose = require('../models/dose'),
    utilObject = require('../commons/util_object'),
    logger = require('../utils/logger'),
    irrigationService = require('../services/irrigation_service');

var nutrientsUsed = function (req, res) {

    var populateCallback = function (error, nutrients) {
        //req, res
        res.json(nutrients);
    };
    irrigationService.calculateUseOfNutrient(req.params.garden_id, populateCallback);
};

var _createDateOfIrrigation = function (date) {

    var parts = date.split("-");
    date = new Date(parts[2], parts[1] - 1, parts[0]);

    var now = new Date();
    var timenow = [now.getHours(), now.getMinutes(), now.getSeconds()].join(':');
    return Date(date + timenow);
};

/**
 * Create one irrigation
 * @param req
 * @param res
 */
var createIrrigation = function (req, res) {

    req.assert('gardenId', 'gardenId should not be empty', req.body.gardenId).notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send('There have been validation errors: ' + util.inspect(errors));
    }

    var doseOut;

    if (req.body.dose) {
        doseOut = JSON.parse(req.body.dose);
    }

    var date = req.body.irrigationDate;

    if (date) {
        date = _createDateOfIrrigation(date);
        console.log('date: ', date);
    }

    Dose.create({
        water: doseOut.water,
        phDose: doseOut.phDose,
        ph: doseOut.ph,
        ec: doseOut.ec,
        nutrients: doseOut.nutrients
    }, function (err, dose) {

        if (err) {
            console.log('Error ', err);
            return res.status(500).send('The dose could not be created');
        }

        Irrigation.create({
            irrigationDate: date,
            quantity: req.body.quantity,
            gardenId: req.body.gardenId,
            doseId: dose._doc._id
        }, function (err, irrigation) {
            if (err) {
                return res.send(err);
            }

            irrigation._doc.dose = doseOut;

            utilObject.convertItemId(irrigation, function () {
                console.log(irrigation);
                return res.json(irrigation);
            });
        });
    });
};

/**
 * Get one irrigation
 * @param req
 * @param res
 */
var getIrrigation = function (req, res) {

    Irrigation.findById(req.params.irrigation_id, function (err, irrigation) {
        if (err) {
            return res.send(err);
        }
        utilObject.convertItemId(irrigation, function () {
            return res.json(irrigation);
        });
    });
};

/**
 * Delete one irrigation
 * @param req
 * @param res
 */
var deleteIrrigation = function (req, res) {

    Irrigation.findById(req.params.irrigation_id, function (err, irrigation) {

        if (err) {
            return res.status(500).send(err.name + ': ' + err.message);
        }

        if (irrigation === null) {
            logger.debug('  The irrigation does not exist!  ');
            return res.status(400).send(' The irrigation does not exist ');
        }

        Irrigation.remove({
            _id: irrigation._doc._id
        }, function (err) {
            if (err) {
                return res.send(err);
            }

            Dose.remove({
                _id: irrigation._doc.doseId
            }, function (err) {
                if (err) {
                    return res.send(err);
                }

                var text = ' The irrigation with id ' + req.params.irrigation_id + ' was deleted. ';
                logger.debug(text);
                var data = {
                    message: text
                };

                return res.status(202).send(data);
            });
        });
    });
};

/**
 * Get all the irrigations
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Irrigation.find(function (err, irrigations) {
        if (err) {
            res.send(err);
        }
        utilObject.convertItemsId(irrigations, function () {
            return res.json(irrigations);
        });
    });
};

module.exports = {
    createIrrigation: createIrrigation,
    deleteIrrigation: deleteIrrigation,
    getIrrigation: getIrrigation,
    getAll: getAll,
    nutrientsUsed: nutrientsUsed
};
"use strict";

var Dose = require('../models/dose');

/**
 * Create one dose with nutrients
 * @param req
 * @param res
 */
var createDose = function (req, res) {

    Dose.create({
        water: req.body.water,
        phDose: req.body.ph_dose,
        ec: req.body.ec,
        ph: req.body.ph,
        nutrients: req.body.nutrients
    }, function (err, dose) {
        if (err) {
            res.send(err);
        }

        res.json(dose);
    });
};

/**
 * Update one dose with nutrients
 * @param req
 * @param res
 */
var updateDose = function (req, res) {

    Dose.findById(req.params.dose_id, function (err, dose) {

        if (err) {
            res.send(err);
        }

        console.log(dose);

        Dose.water = req.body.water;
        Dose.phDose = req.body.ph_dose;
        Dose.ec = req.body.ec;
        Dose.ph = req.body.ph;
        Dose.nutrients = req.body.nutrients;

        // save the dose
        Dose.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.json(dose);
        });
    });
};

/**
 * Get one dose
 * @param req
 * @param res
 */
var getDose = function (req, res) {
    Dose.findById(req.params.dose_id, function (err, dose) {
        if (err) {
            res.send(err);
        }
        res.json(dose);
    });
};

/**
 * Delete one dose
 * @param req
 * @param res
 */
var deleteDose = function (req, res) {
    Dose.remove({
        _id: req.params.dose_id
    }, function (err, dose) {
        if (err) {
            res.send(err);
        }

        dose.find(function (err, dose) {
            if (err) {
                res.send(err);
            }
            res.json(dose);
        });
    });
};

/**
 * Get all the doses for one garden
 * @param req
 * @param res
 */
var getAll = function (req, res) {
    Dose.find(function (err, doses) {
        if (err) {
            res.send(err);
        }
        res.json(doses);
    });
};

module.exports = {
    createDose: createDose,
    updateDose: updateDose,
    deleteDose: deleteDose,
    getDose: getDose,
    getAll: getAll
};





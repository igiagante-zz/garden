var express = require('express');
var router = express.Router(); 
var Dose = require('models/Dose');

//create a dose
var createDose = function(req, res) {

    Dose.create({
            water: req.body.water,  
            phDose: req.body.ph_dose,
            ec: req.body.ec,
            ph: req.body.ph,
            nutrients: req.body.nutrients
        }, function(err, dose) {
            if (err)
                res.send(err);
            
        // get and return all the doses after it creates a new one
        Dose.find(function(err, dose) {
                if (err)
                    res.send(err)
                res.json(dose);
            });
        });       
    };

//update a dose
var updateDose = function(req, res) {

    Dose.findById(req.params.dose_id, function(err, dose) {

            if (err)
                    res.send(err);

            console.log(dose);

        Dose.water = req.body.water;
        Dose.phDose = req.body.ph_dose;
        Dose.ec = req.body.ec;
        Dose.ph = req.body.ph;
        Dose.nutrients = req.body.nutrients;

        // save the dose
        Dose.save(function(err) {
                if (err)
                    res.send(err);
                res.json(dose);
            });
        });
    };
    
//retrieve one dose
var getDose = function(req, res) {
    Dose.findById(req.params.dose_id, function(err, dose) {
            if (err)
                res.send(err);
            res.json(dose);
        });
    };

//delete one dose
var deleteDose = function(req, res) {
        Dose.remove({
            _id : req.params.dose_id
        }, function(err, dose) {
            if (err)
                res.send(err);

            dose.find(function(err, dose) {
                if (err)
                    res.send(err)
                res.json(dose);
            });
        });
    };

//get all doses
var getAll = function(req, res) {       
            Dose.find(function(err, doses) {
                if (err)
                    res.send(err)
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





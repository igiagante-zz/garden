var express = require('express');
var router = express.Router(); 
var Dosis = require('../models/dosis')

//create a dosis
var createDosis = function(req, res) {

        Dosis.create({
            water: req.body.water,  
            ph_dosis: req.body.ph_dosis,
            ec: req.body.ec,
            ph: req.body.ph,
            nutrients: req.body.nutrients
        }, function(err, dosis) {
            if (err)
                res.send(err);
            
            // get and return all the todos after you create another
            Dosis.find(function(err, dosiss) {
                if (err)
                    res.send(err)
                res.json(dosiss);
            });
        });       
    };

//update a dosis
var updateDosis = function(req, res) {

        Dosis.findById(req.params.dosis_id, function(err, dosis) {

            if (err)
                    res.send(err);

            console.log(dosis);

            dosis.water = req.body.water;  
            dosis.ph_dosis = req.body.ph_dosis;
            dosisec = req.body.ec;
            dosis.ph = req.body.ph;
            dosis.nutrients = req.body.nutrients;

            // save the dosis
            dosis.save(function(err) {
                if (err)
                    res.send(err);
                res.json(dosis);
            });
        });
    };
    
//retrieve one dosis
var getDosis = function(req, res) {
        Dosis.findById(req.params.dosis_id, function(err, dosis) {
            if (err)
                res.send(err);
            res.json(dosis);
        });
    };

//delete a dosis
var deleteDosis = function(req, res) {
        Dosis.remove({ 
            _id : req.params.dosis_id 
        }, function(err, dosis) {
            if (err)
                res.send(err);
            
            // get and return all the todos after you create another
            Dosis.find(function(err, dosiss) {
                if (err)
                    res.send(err)
                res.json(dosiss);
            });
        });
    };

//get all dosiss
var getAll = function(req, res) {       
            Dosis.find(function(err, dosiss) {
                if (err)
                    res.send(err)
                res.json(dosiss);
            });
};

module.exports = {
    createDosis: createDosis,
    updateDosis: updateDosis,
    deleteDosis: deleteDosis,
    getDosis: getDosis,
    getAll: getAll
};





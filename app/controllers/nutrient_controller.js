var express = require('express');
var router = express.Router(); 
var Nutrient = require('../models/nutrient')

/**
 * Create one nutrient
 * @param req
 * @param res
 */
var createNutrient = function(req, res) {
        
        Nutrient.create({
            name: req.body.name,  
            ph: req.body.quantity,
            npk: req.body.npk,
            description: req.body.description,
            images: req.body.images
        }, function(err, nutrient) {
            if (err)
                res.send(err);
            
            res.json(nutrient);
        });       
    };

/**
 * Update one nutrient
 * @param req
 * @param res
 */
var updateNutrient = function(req, res) {

    Nutrient.findById(req.params.nutrient_id, function(err, nutrient) {

        if (err)
                res.send(err);

        console.log(nutrient);

        nutrient.name = req.body.name;  
        nutrient.ph = req.body.ph;
        nutrient.npk = req.body.npk;
        nutrient.description = req.body.description;

        // save the nutrient
        nutrient.save(function(err) {
            if (err)
                res.send(err);
            res.json(nutrient);
        });
    });
};
    
//retrieve one nutrient
var getNutrient = function(req, res) {
        Nutrient.findById(req.params.nutrient_id, function(err, nutrient) {
            if (err)
                res.send(err);
            res.json(nutrient);
        });
    };

//delete a nutrient
var deleteNutrient = function(req, res) {
        Nutrient.remove({ 
            _id : req.params.nutrient_id 
        }, function(err, nutrient) {
            if (err)
                res.send(err);
            
            // get and return all the todos after you create another
            Nutrient.find(function(err, nutrients) {
                if (err)
                    res.send(err)
                res.json(nutrients);
            });
        });
    };

//get all nutrients
var getAll = function(req, res) {       
            Nutrient.find(function(err, nutrients) {
                if (err)
                    res.send(err)
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





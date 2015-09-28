var express = require('express');
var router = express.Router(); 
var Nutrient = require('../models/nutrient')

//create a nutrient
var createNutrient = function(req, res) {
        
        Nutrient.create({
            name: req.body.name,  
            quantity: req.body.quantity,
            dose_id: req.body.dose_id
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

//update a nutrient
var updateNutrient = function(req, res) {

    console.log(req.params);

    Nutrient.findById(req.params.nutrient_id, function(err, nutrient) {

        if (err)
                res.send(err);

        console.log(nutrient);

        nutrient.name = req.body.name;  
        nutrient.quantity = req.body.quantity;
        nutrient.dose_id = req.body.dose_id;

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





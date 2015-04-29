var express = require('express');
var router = express.Router(); 
var Garden = require('../models/garden')

//create a garden
var createGarden = function(req, res) {
        
        Garden.create({  
            name: req.body.name,
        }, function(err, garden) {
            if (err)
                res.send(err);
            
            // get and return all the gardens after you create another
            Garden.find(function(err, gardens) {
                if (err)
                    res.send(err)
                res.json(gardens);
            });
        });       
    };

//update a garden
var updateGarden = function(req, res) {

    console.log(req.params);

    Garden.findById(req.params.garden_id, function(err, garden) {

        if (err)
                res.send(err);

        console.log(garden);

        garden.name = req.body.name;
        garden.startDate = req.body.startDate;  
        garden.endDate = req.body.endDate; 
        // save the garden
        garden.save(function(err) {
            if (err)
                res.send(err);
            res.json(garden);
        });
    });
};
    
//retrieve one garden
var getGarden = function(req, res) {
        Garden.findById(req.params.garden_id, function(err, garden) {
            if (err)
                res.send(err);
            res.json(garden);
        });
    };

//delete a garden
var deleteGarden = function(req, res) {
        Garden.remove({ 
            _id : req.params.garden_id 
        }, function(err, garden) {
            if (err)
                res.send(err);
            
            // get and return all the todos after you create another
            Garden.find(function(err, gardens) {
                if (err)
                    res.send(err)
                res.json(gardens);
            });
        });
    };

//get all gardens
var getAll = function(req, res) {       
            Garden.find(function(err, gardens) {
                if (err)
                    res.send(err)
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
var express = require('express');
var router = express.Router(); 
var Irrigation = require('../models/irrigation')
var irrigationService = require('../services/irrigation_service')

var nutrientsUsed = function(req, res) {
    
    var populateCallback = function(error, nutrients) {
        //req, res
        res.json(nutrients);
    };
    irrigationService.calculateUseOfNutrient(req.params.garden_id, populateCallback);
};

/**
 * Create one irrigation
 * @param req
 * @param res
 */
var createIrrigation = function(req, res) {
        
        Irrigation.create({
            irrigationDate: req.body.irrigationDate,  
            quantity: req.body.quantity,
            gardenId: req.body.gardenId,
            doseId: req.body.doseId
        }, function(err, irrigation) {
            if (err)
                res.send(err);
            
            // get and return all the irrigations after you create another
            Irrigation.find(function(err, irrigations) {
                if (err)
                    res.send(err)
                res.json(irrigations);
            });
        });       
    };

/**
 * Update one irrigation
 * @param req
 * @param res
 */
var updateIrrigation = function(req, res) {

    console.log(req.params);

    Irrigation.findById(req.params.irrigation_id, function(err, irrigation) {

        if (err)
                res.send(err);

        console.log(irrigation);

        irrigation.irrigationDate = req.body.irrigationDate;  
        irrigation.quantity = req.body.quantity;
        irrigation.gardenId = req.body.gardenId;
        irrigation.doseId = req.body.doseId;

        // save the irrigation
        irrigation.save(function(err) {
            if (err)
                res.send(err);
            res.json(irrigation);
        });
    });
};

/**
 * Get one irrigation
 * @param req
 * @param res
 */
var getIrrigation = function(req, res) {
        Irrigation.findById(req.params.irrigation_id, function(err, irrigation) {
            if (err)
                res.send(err);
            res.json(irrigation);
        });
    };

/**
 * Delete one irrigation
 * @param req
 * @param res
 */
var deleteIrrigation = function(req, res) {
        Irrigation.remove({ 
            _id : req.params.irrigation_id 
        }, function(err, irrigation) {
            if (err)
                res.send(err);
            
            // get and return all the todos after you create another
            Irrigation.find(function(err, irrigations) {
                if (err)
                    res.send(err)
                res.json(irrigations);
            });
        });
    };

/**
 * Get all the irrigations
 * @param req
 * @param res
 */
var getAll = function(req, res) {       
            Irrigation.find(function(err, irrigations) {
                if (err)
                    res.send(err)
                res.json(irrigations);
            });
};

module.exports = {
    createIrrigation: createIrrigation,
    updateIrrigation: updateIrrigation,
    deleteIrrigation: deleteIrrigation,
    getIrrigation: getIrrigation,
    getAll: getAll
};
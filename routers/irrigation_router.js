var express = require('express');
var router = express.Router(); 
var Irrigation = require('../models/irrigation')
var irrigationService = require('../services/irrigation_service')

router.get('/garden/:garden_id', function(req, res) {
    
    var callback = function(error, nutrients) {
        //req, res
        res.json(nutrients);
    }
    
    irrigationService.calculateUseOfNutrient(req.params.garden_id, callback);
});

//create a irrigation
router.post('/', function(req, res) {
        
        Irrigation.create({
            irrigationDate: req.body.irrigationDate,  
            quantity: req.body.quantity,
            gardenId: req.body.gardenId,
            dosisId: req.body.dosisId
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
    });

//update a irrigation
router.put('/:irrigation_id', function(req, res) {

    console.log(req.params);

    Irrigation.findById(req.params.irrigation_id, function(err, irrigation) {

        if (err)
                res.send(err);

        console.log(irrigation);

        irrigation.irrigationDate = req.body.irrigationDate;  
        irrigation.quantity = req.body.quantity;
        irrigation.gardenId = req.body.gardenId;
        irrigation.dosisId = req.body.dosisId;

        // save the irrigation
        irrigation.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'irrigation updated!' });
        });
    });
});
    
//retrieve one irrigation
router.get('/:irrigation_id', function(req, res) {
        Irrigation.findById(req.params.irrigation_id, function(err, irrigation) {
            if (err)
                res.send(err);
            res.json(irrigation);
        });
    });

//delete a irrigation
router.delete('/:irrigation_id', function(req, res) {
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
    });

//get all irrigations
router.get('/', function(req, res) {       
            Irrigation.find(function(err, irrigations) {
                if (err)
                    res.send(err)
                res.json(irrigations);
            });
});

module.exports = router;





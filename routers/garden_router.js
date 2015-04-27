var express = require('express');
var router = express.Router(); 
var Garden = require('../models/garden')

//create a garden
router.post('/', function(req, res) {
        
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
    });

//update a garden
router.put('/:garden_id', function(req, res) {

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
            res.json({ message: 'garden updated!' });
        });
    });
});
    
//retrieve one garden
router.get('/:garden_id', function(req, res) {
        Garden.findById(req.params.garden_id, function(err, garden) {
            if (err)
                res.send(err);
            res.json(garden);
        });
    });

//delete a garden
router.delete('/:garden_id', function(req, res) {
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
    });

//get all gardens
router.get('/', function(req, res) {       
            Garden.find(function(err, gardens) {
                if (err)
                    res.send(err)
                res.json(gardens);
            });
});

module.exports = router;
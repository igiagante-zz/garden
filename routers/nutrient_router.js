var express = require('express');
var router = express.Router(); 
var Nutrient = require('../models/nutrient')

//create a nutrient
router.post('/', function(req, res) {
        
        Nutrient.create({
            name: req.body.name,  
            quantity: req.body.quantity,
            dosis_id: req.body.dosis_id
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
    });

//update a nutrient
router.put('/:nutrient_id', function(req, res) {

    console.log(req.params);

    Nutrient.findById(req.params.nutrient_id, function(err, nutrient) {

        if (err)
                res.send(err);

        console.log(nutrient);

        nutrient.name = req.body.name;  
        nutrient.quantity = req.body.quantity;
        nutrient.dosis_id = req.body.dosis_id;

        // save the nutrient
        nutrient.save(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Nutrient updated!' });
        });
    });
});
    
//retrieve one nutrient
router.get('/:nutrient_id', function(req, res) {
        Nutrient.findById(req.params.nutrient_id, function(err, nutrient) {
            if (err)
                res.send(err);
            res.json(nutrient);
        });
    });

//delete a nutrient
router.delete('/:nutrient_id', function(req, res) {
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
    });

//get all nutrients
router.get('/', function(req, res) {       
            Nutrient.find(function(err, nutrients) {
                if (err)
                    res.send(err)
                res.json(nutrients);
            });
});

module.exports = router;





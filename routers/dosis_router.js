var express = require('express');
var router = express.Router(); 
var Dosis = require('../models/dosis')

//create a dosis
router.post('/', function(req, res) {

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
    });

//update a dosis
router.put('/:dosis_id', function(req, res) {

        console.log(req.params);

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
                res.json({ message: 'dosis updated!' });
            });
        });
    });
    
//retrieve one dosis
router.get('/:dosis_id', function(req, res) {
        Dosis.findById(req.params.dosis_id, function(err, dosis) {
            if (err)
                res.send(err);
            res.json(dosis);
        });
    });

//delete a dosis
router.delete('/:dosis_id', function(req, res) {
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
    });

//get all dosiss
router.get('/', function(req, res) {       
            Dosis.find(function(err, dosiss) {
                if (err)
                    res.send(err)
                res.json(dosiss);
            });
});

module.exports = router;





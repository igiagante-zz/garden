var router = express.Router(); 
var Nutrient = require('./models/nutrient')

router.route('/nutrients')
    // create a nutrient (accessed at POST http://localhost:8080/api/nutrients)
    .post(function(req, res) {
        
        Nutrient.create({
            name = req.body.name;  
        	quantity = req.body.quantity;
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

router.route('/nutrients')
    .get(function(req, res) {       
            Nutrient.find(function(err, nutrients) {
                if (err)
                    res.send(err)
                res.json(nutrients);
            });
    });

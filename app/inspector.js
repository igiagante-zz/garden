/**
 * Created by igiagante on 29/9/15.
 */
var logger = require('../utils/logger');

require('./start.js');

logger.info("Initialized request inspector!");
console.log("Initialized request inspector!"); //conceptually right!

require('opener')('http://localhost:9000'); //Cuando se parametrize el server de req inspector, obtener del config el host, puerto

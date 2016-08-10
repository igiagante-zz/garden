/**
 * Created by igiagante on 28/7/16.
 */


"use strict";

var express = require('express'),
    userController = require('../controllers/user_controller'),
    router = express.Router();

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.post('/refreshToken', userController.refreshToken);

module.exports = router;
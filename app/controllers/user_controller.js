/**
 * Created by igiagante on 29/7/16.
 */

"use strict";

var User = require('../models/user'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    auth = require('../../config/auth');

var _createToken = function(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, "days").unix()
    };
    return jwt.encode(payload, auth.secret);
};

var signup = function(req, res) {
    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });
        // save the user
        newUser.save(function(err, user) {
            if (err) {
                return res.json({success: false, msg: 'Username already exists.'});
            }

            var token = _createToken(user);
            return res.status(200).json({ token : token });
        });
    }
};

var login = function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = _createToken(user);
                    // return the information including token as JSON
                    res.json({success: true, token: token});
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
};

module.exports = {
    signup: signup,
    login: login
};
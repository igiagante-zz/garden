/**
 * Created by igiagante on 29/7/16.
 */

"use strict";

var User = require('../models/user'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    auth = require('../../config/auth'),
    userService = require('../services/user_service');

var invalidUser = 'INVALID_USER';
var userNotFound = 'USER_NOT_FOUND';
var wrongPassword = 'WRONG_PASSWORD';

var _createToken = function (user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(1, "days").unix()
    };
    return jwt.encode(payload, auth.secret);
};

var signup = function (req, res) {

    var username = req.body.username;
    if (!username || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: username,
            password: req.body.password
        });

        var nameOfUser = username.split('@')[0];

        userService.createUserPublicFolders(nameOfUser, function (err) {
            if (err) {
                return res.status(505).send(' There was an error trying to create users\'s folders');
            }

            // save the user
            newUser.save(function (err, user) {
                if (err) {
                    return res.status(409).send({message: invalidUser});
                }
                var token = _createToken(user);
                return res.status(200).json({token: token});
            });
        });
    }
};

var login = function (req, res) {
    User.findOne({
        name: req.body.username
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.status(404).send({message: userNotFound});
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = _createToken(user);
                    // return the information including token as JSON
                    res.status(200).json({token: token});
                } else {
                    res.status(403).send({message: wrongPassword});
                }
            });
        }
    });
};

var refreshToken = function (req, res) {
    User.findOne({
        _id: req.body.userId
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.send({message: userNotFound});
        } else {
            // if user is found, lets create a token
            var token = _createToken(user);
            // return the information including token as JSON
            return res.status(200).json({token: token});
        }
    });
};

module.exports = {
    signup: signup,
    login: login,
    refreshToken: refreshToken
};
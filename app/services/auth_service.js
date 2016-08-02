/**
 * Created by igiagante on 29/7/16.
 */

var jwt = require('jwt-simple'),
    auth = require('../../config/auth'),
    User = require('../models/user');

var getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

var isUserAuthenticated = function (req, isUserAuthenticatedCallback) {

    var token = getToken(req.headers);

    var payload = jwt.decode(token, auth.secret);

    if(payload.exp <= moment().unix()) {
        return res
            .status(401)
            .send({message: "The token has expired"});
    }

    req.user = payload.sub;

    User.findOne({
        name: decoded.name
    }, function (err, user) {
        if (err) {
            return isUserAuthenticatedCallback(err);
        }
        return isUserAuthenticatedCallback(undefined, user);
    });
};

module.exports = {
    isUserAuthenticated: isUserAuthenticated
};
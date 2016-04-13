var Token = require('../models/token');
var User = require('../models/user');

var generatePassword = function() {
    var length = 8,
        charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

var AuthService = {};

//if token validation passes, update the expired_date
AuthService.checkToken = function(req, res, next) {
    var user_id = req.params.user_id || req.body.user_id;
    var token = req.headers.token;
    if (!token) {
        var error = new Error("token is empty");
        res.statusCode = 401;
        return next(error);
    }
    var condition = {};
    condition.token = token;
    Token.findOne(condition, function(err, token) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        if (!token) {
            var error = new Error("token is invalid");
            res.statusCode = 401;
            return next(error);
        }
        var now = Date.now();
        User.findOne({
            _id: token.user_id
        }, '+role_id', function(err, user) {

            if (err) {
                res.statusCode = 500;
                return next(err);
            }
            if (!user) {
                res.statusCode = 401;
                return next(new Error('Can not find user'));
            }
            if (user.role_id === 1) {//if it's admin role
                req.isAdmin = true;
            } else if (user_id && token.user_id !== user_id) {//if it's not admin role
                res.statusCode = 401;
                return next(new Error('The token does not belong to the user'));
            }
            var now = Date.now();

            //check if the token expires
            if ((now - token.expired_date.getTime()) > 1000 * 60 * 30) {
                res.statusCode = 401;
                var error = new Error("token has been expired");
                return next(error);
            }
            Token.update({
                token: token.token
            }, {
                $set: {
                    expired_date: now
                }
            }, function(err) {
                if (err) {
                    res.statusCode = 500;
                    return next(err);
                }
                next();
            })

        });
    });
}

AuthService.checkAdminRole = function(req, res, next) {
    if (req.isAdmin) {
        next();
    } else {
        res.statusCode = 401;
        var error = new Error("It's not admin token");
        return next(error);
    }
}

AuthService.removeToken = function(req, res, next) {
    Token.remove({
        'user_id': req.params.user_id
    }, function(err) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    });
}

module.exports = AuthService;

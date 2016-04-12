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
    var condition = {
        user_id: user_id,
        token: token
    };
    console.log(condition);
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

        //check if the token expires
        if ((now - token.expired_date.getTime()) > 1000 * 60 * 30) {
            console.log('token expired');
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
                next(err);
            }
            next();
        });
    });
}

AuthService.checkAdminRole = function(req, res, next) {
    var token = req.headers.token;

    var condition = {
        token: token
    };
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
                return next(new Error('Can not find admin user'));
            }
            if (user.role_id !== 1) {
                res.statusCode = 401;
                return next(new Error('The user is not admin'));
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

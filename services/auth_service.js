var Token = require('../models/token');

var AuthService = {};

AuthService.checkToken = function(req, res, next) {
    var user_id = req.headers.user_id;
    var token = req.headers.token;
    var condition = {
        user_id: user_id,
        token: token,
    };
    Token.findOne(condition, function(err, token) {
        if (err) {
            res.status = 500;
            return next(err);
        }
        if (!token) {
            var error = new Error("token is null");
            res.status = 401;
            return next(error);
        }
        var now = Date.now();
        console.log(now);
        console.log(token.expired_date.getTime());
        console.log(now - token.expired_date.getTime());
        console.log((now - token.expired_date.getTime()) > 1000 * 60 * 30);
        //check if the token expires
        if ((now - token.expired_date.getTime()) > 1000 * 60 * 30) {
        	console.log('expired');
            res.status = 401;
            var error = new Error("token has been expired");
            return next(error);
        }
        next();
    });

}

AuthService.generatePassword = function() {
    var length = 8,
        charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}


module.exports = AuthService;
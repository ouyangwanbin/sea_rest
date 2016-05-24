var User = require('../models/user');
var Token = require('../models/token');
var bcrypt = require('bcryptjs');
var AuthService = require('../services/auth_service');

var UserService = {};

UserService.createUser = function(req, res, next) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);

    // create a instance of User model
    var user = new User();
    user.email = req.body.email;
    user.password = hash;
    // save the user and check for errors
    user.save(function(err) {
        console.log(err);
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    });
}

UserService.checkUserExist = function(req, res) {
    var user = new User();
    User.count({
        email: req.params.user_email,
        role_id: req.params.role_id
    }, function(err, count) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        result.data = {
            count: count
        };
        res.json(result);
    })
}

UserService.authenticate = function(req, res, next) {
    //check user and password
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }

        if (!user) {
            res.statusCode = 400;
            return next(new Error('incorrect user / password'));
        } else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                //remove the previous token of the user,this can prevent multiple login to generate many tokens
                Token.remove({
                    user_id: user._id
                }, function(err) {
                    if (err) {
                        res.statusCode = 500;
                        return next(err);
                    }
                    //generate token
                    var time = Date.now();
                    var salt = bcrypt.genSaltSync(10);
                    var hash = bcrypt.hashSync(time.toString(), salt);
                    //create token instance
                    var token = new Token();
                    token.user_id = user._id;
                    token.token = hash;
                    token.expired_date = time + 1000 * 60 * 30; // token will be expired in 30 minutes
                    token.save(function(err) {
                        if (err) {
                            res.statusCode = 500;
                            return next(err);
                        }
                        var result = {};
                        result.status = "success";

                        // convert to normal javascript object , so we can delete the property
                        user = user.toObject();
                        delete user.password;
                        result.data = {
                            user: user,
                            token: token.token
                        };
                        res.json(result);
                    })

                })
            } else {
                res.statusCode = 400;
                return next(new Error('incorrect user / password'));
            }
        }
    });
}

UserService.forgetPassword = function(req, res, next) {
    User.findOne({
        email: req.params.user_email
    }, function(err, user) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        if (!user) {
            res.statusCode = 400;
            return next(new Error('Can not find user'));
        }
        //generate new password and update the user model
        var newPassword = AuthService.generatePassword();
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newPassword, salt);
        User.update({
            email: req.params.user_email
        }, {
            $set: {
                password: hash
            }
        }, function(err, raw) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            result.data = {
                password: newPassword
            };
            res.json(result);
        });
    });
}

UserService.getAllUsers = function(req, res, next) {
    User.find({}, function(err, users) {
        if (err) {
            res.status = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        result.data = {
            users: users
        }
        res.json(result);
    });
}

UserService.removeUser = function(req, res, next) {
    User.remove({
        _id: req.params.user_id
    }, function(err) {
        if (err) {
            res.status = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    });
}

UserService.updateUser = function(req, res, next) {
    var update = {};
    update.$set = {};
    if( req.body.email ){
        update.$set.email = req.body.email;
    }
    if( req.body.password ){
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        update.$set.password = hash;
    }

    User.update({
        _id: req.params.user_id
    }, update, function(err) {
        if (err) {
            res.status = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    })
}

module.exports = UserService;

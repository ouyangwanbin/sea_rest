var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Token = require('../models/token');
var Product = require('../models/product');
var Order = require('../models/order');
var bcrypt = require('bcrypt');
var AuthService = require('../services/auth_service');

//middleware to use fsor all requests.
router.use(function(req, res, next) {
    next();
});

router.get('/', function(req, res) {
    res.json({
        message: 'welcome to use go2fish api'
    });
});

/************************* User API ***************************************/
router.route('/users')
    // create a user 
    .post(function(req, res, next) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);

        // create a instance of User model
        var user = new User();
        user.email = req.body.email;
        user.password = hash;
        // save the user and check for errors
        user.save(function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    });

//search user by email
router.route('/search-user/:user_email')
    .get(function(req, res) {
        var user = new User();
        User.count({
            email: req.params.user_email
        }, function(err, count) {
            console.log(err);
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            result.data = {
                count: count
            };
            res.json(result);
        })
    });

//user login
router.route('/login')
    .post(function(req, res, next) {
        //check user and password
        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.status = 500;
                return next(err);
            }

            if (!user) {
                res.status = 400;
                return next(new Error('incorrect user / password'));
            } else {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    //remove the previous token of the user,this can prevent multiple login to generate many tokens
                    Token.remove({
                        user_id: user._id
                    }, function(err) {
                        if (err) {
                            res.status = 500;
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
                                res.status = 500;
                                return next(err);
                            }
                            var result = {};
                            result.status = "success";

                            // convert to normal javascript object , so we can delete the property
                            user = user.toObject();
                            delete user.password;
                            result.data = {
                                user: user,
                                token: token
                            };
                            res.json(result);
                        })

                    })


                } else {
                    res.status = 400;
                    return next(new Error('incorrect user / password'));
                }
            }
        });
    });

//forget password
router.route('/forget-password/:user_email')
    .get(function(req, res, next) {
        User.findOne({
            email: req.params.user_email
        }, function(err, user) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            if (!user) {
                res.status = 400;
                return next(new Error('Can not find user'));
            }
            //generate new password and update the user model
            var newPassword = AuthService.generatePassword();
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(newPassword, salt);
            User.update({
                email: req.params.user_email
            }, {
                password: hash
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
    });

router.route('/logout')
    .delete(AuthService.checkToken,function(req, res, next) {
        Token.remove({
            'user_id': req.body.user_id
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    });

router.route('/users/:user_id')
    // get the user with that id
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.json(user);
        });
    });

module.exports = router;
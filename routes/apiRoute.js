var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Token = require('../models/token');
var Product = require('../models/product');
var Order = require('../models/order');
var Place = require('../models/place');
var bcrypt = require('bcryptjs');
var AuthService = require('../services/auth_service');


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
            result.status = "success"
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
                                token: token.token
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
    });

router.route('/reset-password/:user_id')
    .post(AuthService.checkToken, function(req, res, next) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        User.update({
            _id: req.params.user_id
        }, {
            $set: {
                password: hash
            }
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        })
    });

//user logout
router.route('/logout')
    .delete(AuthService.checkToken, function(req, res, next) {
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

//admin get all users

router.route('/users')
    .get(AuthService.checkAdminRole, function(req, res, next) {
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
    });

router.route('/users/:user_id')
    .delete(AuthService.checkAdminRole, function(req, res, next) {
        console.log('remove');
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
    })
    .put(AuthService.checkToken, function(req, res, next) {
        User.update({
            _id: req.params.user_id
        }, {
            $set: {
                email: req.body.email,
                id_receive_msg: id_receive_msg
            }
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        })
    });

/************************* Order API ***************************************/

//admin create an order for any user
router.route('/orders')
    //add one order
    .post(AuthService.checkAdminRole, function(req, res, next) {
        var order = new Order();
        order.user_id = req.body.user_id;
        order.product_id = req.body.product_id;
        order.order_num = req.body.order_num;
        order.order_unit = req.body.order_unit;
        order.place_id = req.body.place_id;
        order.order_note = req.body.order_note;
        order.save(function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            //update product quantity
            Product.update({
                _id: order.product_id
            }, {
                $inc: {
                    product_quantity: -order.order_num
                }
            }, function(err) {
                if (err) {
                    res.status = 500;
                    next(err);
                }
                var result = {};
                result.status = "success";
                res.json(result);
            })

        });
    });
//admin update user's order
router.route('/orders/:order_id')
    .put(AuthService.checkAdminRole, function(req, res, next) {
        Order.findOne({
            _id: req.params.order_id
        }, function(err, order) {
            var origin_num = order.order_num;
            var product_id = order.product_id;
            Order.update({
                _id: req.params.order_id
            }, {
                $set: {
                    order_num: req.body.order_num,
                    order_status: req.body.order_status
                }
            }, function(err) {
                if (err) {
                    res.status = 500;
                    return next(err);
                }
                //update product quantity
                Product.update({
                    _id: product_id
                }, {
                    $inc: {
                        product_quantity: origin_num - req.body.order_num 
                    }
                }, function(err) {
                    if (err) {
                        res.status = 500;
                        return next(err);
                    }
                    var result = {};
                    result.status = "success";
                    res.json(result);
                })
            })
        });
    })
    //admin delete orders
    .delete(AuthService.checkAdminRole, function(req, res, next) {
        Order.findOne({
            _id: req.params.order_id
        }, function(err, order) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var order_num = order.order_num;
            Order.remove({
                _id: req.params.order_id,
                user_id: req.params.user_id
            }, function(err) {
                if (err) {
                    res.status = 500;
                    return next(err);
                }
                //update product quantity
                Product.update({
                    _id: order.product_id
                }, {
                    $inc: {
                        product_quantity: order_num
                    }
                }, function(err) {
                    if (err) {
                        res.status = 500;
                        return next(err);
                    }
                    var result = {};
                    result.status = "success";
                    res.json(result);
                })
            })
        });
    });

router.route('/users/:user_id/orders')
    .post(AuthService.checkToken, function(req, res, next) {
        var order = new Order();
        order.user_id = req.params.user_id;
        order.product_id = req.body.product_id;
        order.order_num = req.body.order_num;
        order.order_unit = req.body.order_unit;
        order.order_note = req.body.order_note;
        order.place_id = req.body.place_id
        order.save(function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            //update product quantity
            Product.update({
                _id: order.product_id
            }, {
                $inc: {
                    product_quantity: -order.order_num
                }
            }, function(err) {
                if (err) {
                    console.log(err);
                    res.status = 500;
                    return next(err);
                }
                var result = {};
                result.status = "success";
                res.json(result);
            })
        });
    })

router.route('/users/:user_id/orders/:order_id')
    .get(AuthService.checkToken, function(req, res, next) {
        Order.findOne({
            _id: req.params.order_id,
            user_id: req.params.user_id
        }, function(err, order) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            result.data = {
                order: order
            }
            res.json(result);
        });
    })
    .delete(AuthService.checkToken, function(req, res, next) {
        Order.findOne({
            _id: req.params.order_id
        }, function(err, order) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var order_num = order.order_num;
            Order.remove({
                _id: req.params.order_id,
                user_id: req.params.user_id
            }, function(err) {
                if (err) {
                    res.status = 500;
                    return next(err);
                }
                //update product quantity
                Product.update({
                    _id: order.product_id
                }, {
                    $inc: {
                        product_quantity: order_num
                    }
                }, function(err) {
                    if (err) {
                        res.status = 500;
                        return next(err);
                    }
                    var result = {};
                    result.status = "success";
                    res.json(result);
                })
            })
        });
    })
    .put(AuthService.checkToken, function(req, res, next) {
        Order.findOne({
            _id: req.params.order_id
        }, function(err, order) {
            var origin_num = order.order_num;
            var product_id = order.product_id;
            Order.update({
                user_id: req.params.user_id,
                _id: req.params.order_id
            }, {
                $set: {
                    order_num: req.body.order_num
                }
            }, function(err) {
                if (err) {
                    res.status = 500;
                    return next(err);
                }
                //update product quantity
                Product.update({
                    _id: product_id
                }, {
                    $inc: {
                        product_quantity: origin_num - req.body.order_num 
                    }
                }, function(err) {
                    if (err) {
                        res.status = 500;
                        return next(err);
                    }
                    var result = {};
                    result.status = "success";
                    res.json(result);
                })
            })
        });
    })

/************************* Product API ***************************************/
router.route('/products')
    .get(function(req, res, next) {
        Product.find({}, function(err, products) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            result.data = {
                products: products
            }
            res.json(result);
        })
    })
    .post(AuthService.checkAdminRole, function(req, res, next) {
        var product = new Product();
        product.product_name = req.body.product_name;
        product.product_price = req.body.product_price;
        product.product_unit = req.body.product_unit;
        product.product_image = req.body.product_image;
        product.product_description = req.body.product_description;
        product.product_quantity = req.body.product_quantity;
        product.save(function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    });

router.route('/products/:product_id')
    .put(AuthService.checkAdminRole, function(req, res, next) {
        Product.update({
            _id: req.params.product_id
        }, {
            $set: {
                product_name: req.body.product_name,
                product_price: req.body.product_price,
                product_unit: req.body.product_unit,
                product_image: req.body.product_image,
                product_description: req.body.product_description,
                product_quantity: req.body.product_quantity
            }
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    })
    .delete(AuthService.checkAdminRole, function(req, res, next) {
        Product.remove({
            _id: req.params.product_id
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    })

/************************* Place API ***************************************/
router.route('/places')
    .get(function(req, res, next) {
        Place.find({}, function(err, places) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            result.data = {
                places: places
            }
            res.json(result);
        })
    })
    .post(AuthService.checkAdminRole, function(req, res, next) {
        var place = new Place();
        place.address = req.body.address;
        place.time = req.body.time;
        place.save(function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    });

router.route('/places/:place_id')
    .put(AuthService.checkAdminRole, function(req, res, next) {
        Product.update({
            _id: req.params.place_id
        }, {
            $set: {
                address: req.body.address,
                time: req.body.time
            }
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    })
    .delete(AuthService.checkAdminRole, function(req, res, next) {
        Product.remove({
            _id: req.params.place_id
        }, function(err) {
            if (err) {
                res.status = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        });
    })
module.exports = router;
var Order = require('../models/order');
var Product = require('../models/product');
var AuthService = require('../services/auth_service');

var OrderService = {};

OrderService.addOrder = function(req, res, next) {
    var order = new Order();
    order.user_id = req.body.user_id;
    order.product_id = req.body.product_id;
    order.order_num = req.body.order_num;
    order.order_unit = req.body.order_unit;
    order.place_id = req.body.place_id;
    order.order_note = req.body.order_note;
    order.save(function(err) {
        if (err) {
            res.statusCode = 500;
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
                res.statusCode = 500;
                next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        })

    });
}

OrderService.updateOrder = function(req, res, next) {
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
                res.statusCode = 500;
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
                    res.statusCode = 500;
                    return next(err);
                }
                var result = {};
                result.status = "success";
                res.json(result);
            })
        })
    });
}

OrderService.removeOrder = function(req, res, next) {
    Order.findOne({
        _id: req.params.order_id
    }, function(err, order) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var order_num = order.order_num;
        Order.remove({
            _id: req.params.order_id,
            user_id: req.params.user_id
        }, function(err) {
            if (err) {
                res.statusCode = 500;
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
                    res.statusCode = 500;
                    return next(err);
                }
                var result = {};
                result.status = "success";
                res.json(result);
            })
        })
    });
}

OrderService.addUserOrder = function(req, res, next) {
    var order = new Order();
    order.user_id = req.params.user_id;
    order.product_id = req.body.product_id;
    order.order_num = req.body.order_num;
    order.order_unit = req.body.order_unit;
    order.order_note = req.body.order_note;
    order.place_id = req.body.place_id
    order.save(function(err) {
        if (err) {
            res.statusCode = 500;
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
                res.statusCode = 500;
                return next(err);
            }
            var result = {};
            result.status = "success";
            res.json(result);
        })
    });
}

OrderService.findUserOrder = function(req, res, next) {
    Order.findOne({
        _id: req.params.order_id,
        user_id: req.params.user_id
    }, function(err, order) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        result.data = {
            order: order
        }
        res.json(result);
    });
}

OrderService.removeUserOrder = function(req, res, next) {
    Order.findOne({
        _id: req.params.order_id
    }, function(err, order) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var order_num = order.order_num;
        Order.remove({
            _id: req.params.order_id,
            user_id: req.params.user_id
        }, function(err) {
            if (err) {
                res.statusCode = 500;
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
                    res.statusCode = 500;
                    return next(err);
                }
                var result = {};
                result.status = "success";
                res.json(result);
            })
        })
    });
}

OrderService.updateUserOrder = function(req, res, next) {
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
                res.statusCode = 500;
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
                    res.statusCode = 500;
                    return next(err);
                }
                var result = {};
                result.status = "success";
                res.json(result);
            })
        })
    });
}


module.exports = OrderService;

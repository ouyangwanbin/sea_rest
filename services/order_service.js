var Order = require('../models/order');
var Product = require('../models/product');
var AuthService = require('../services/auth_service');

var OrderService = {};

OrderService.addOrder = function(req, res, next) {
    var order = new Order();
    order.user_id = req.params.user_id;
    order.product_id = req.body.product_id;
    order.order_num = req.body.order_num;
    order.order_unit = req.body.order_unit;
    order.order_note = req.body.order_note;
    order.place_id = req.body.place_id;
    order.save(function(err) {
        if (err) {
            console.log(err);
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

OrderService.findOrder = function(req, res, next) {
    var condition = {};
    if (req.params.order_id) {
        condition._id = req.params.order_id;
    }
    if (req.params.user_id) {
        condition.user_id = req.params.user_id;
    }

    Order.find(condition, function(err, orders) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        result.data = {
            orders: orders
        }
        res.json(result);
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

OrderService.updateOrder = function(req, res, next) {
    var update = {};
    update.$set = {};
    if (req.body.order_num) {
        update.$set.order_num = req.body.order_num;
    }
    if (req.body.place_id) {
        update.$set.place_id = req.body.place_id;
    }
    if (req.body.order_note) {
        update.$set.order_note = req.body.order_note;
    }
    Order.update({
        _id: req.params.order_id
    }, update, function(err) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        if (req.body.order_num) {
            //update product quantity
            Product.update({
                _id: req.body.product_id
            }, {
                $inc: {
                    product_quantity: -req.body.order_num
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
        }
    })
}


module.exports = OrderService;

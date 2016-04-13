var AuthService = require('../services/auth_service');
var Product = require('../models/product');
var ProductService = {};

ProductService.getProducts = function(req, res, next) {
    Product.find({}, function(err, products) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        result.data = {
            products: products
        }
        res.json(result);
    })
}

ProductService.addProduct = function(req, res, next) {
    var product = new Product();
    product.product_name = req.body.product_name;
    product.product_price = req.body.product_price;
    product.product_unit = req.body.product_unit;
    product.product_image = req.body.product_image;
    product.product_description = req.body.product_description;
    product.product_quantity = req.body.product_quantity;
    product.save(function(err) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    });
}

ProductService.updateProduct = function(req, res, next) {
    var update = {};
    update.$set = {};
    if( req.body.product_name ){
        update.$set.product_name = req.body.product_name;
    }
    if( req.body.product_price ){
        update.$set.product_price = req.body.product_price;
    }
    if( req.body.product_unit ){
         update.$set.product_unit = req.body.product_unit;
    }
    if( req.body.product_image ){
        update.$set.product_image = req.body.product_image;
    }
    if( req.body.product_description ){
        update.$set.product_description = req.body.product_description;
    }
    if( req.body.product_quantity ){
        update.$set.product_quantity = req.body.product_quantity;
    }
    Product.update({
        _id: req.params.product_id
    }, update, function(err) {
        if (err) {
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    });
}

ProductService.removeProduct = function(req, res, next) {
    Product.remove({
        _id: req.params.product_id
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

module.exports = ProductService;

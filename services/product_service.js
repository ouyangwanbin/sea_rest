var AuthService = require('../services/auth_service');

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

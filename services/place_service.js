var AuthService = require('../services/auth_service');

var PlaceService = {};

PlaceService.getPlaces = function(req, res, next) {
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
}

PlaceService.addPlace = function(req, res, next) {
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
}

PlaceService.updatePlace = function(req, res, next) {
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
}

PlaceService.removePlace = function(req, res, next) {
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
}

module.exports = PlaceService;

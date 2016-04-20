var AuthService = require('../services/auth_service');
var Place = require('../models/place');
var PlaceService = {};

PlaceService.getPlaces = function(req, res, next) {
    Place.find({}, function(err, places) {
        if (err) {
            res.statusCode = 500;
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
            res.statusCode = 500;
            return next(err);
        }
        var result = {};
        result.status = "success";
        res.json(result);
    });
}

PlaceService.updatePlace = function(req, res, next) {
    var update = {};
    update.$set = {};
    if( req.body.address ){
        update.$set.address = req.body.address;
    }
    if( req.body.time ){
        update.$set.time = req.body.time;
    }
    Place.update({
        _id: req.params.place_id
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

PlaceService.removePlace = function(req, res, next) {
    Place.remove({
        _id: req.params.place_id
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

module.exports = PlaceService;

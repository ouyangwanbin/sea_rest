var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Token = require('../models/token');
var Product = require('../models/product');
var Order = require('../models/order');
var Place = require('../models/place');
var bcrypt = require('bcryptjs');
var AuthService = require('../services/auth_service');
var UserService = require('../services/user_service');
var OrderService = require('../services/order_service');
var ProductService = require('../services/product_service');
var PlaceService = require('../services/place_service');

router.get('/', function(req, res) {
    res.json({
        message: 'welcome to use go2fish api'
    });
});

/************************* User API ***************************************/
router.post('/users', UserService.createUser);
router.get('/users/:user_email', UserService.checkUserExist);
router.post('/auth', UserService.authenticate);
router.get('/users', [AuthService.checkToken , AuthService.checkAdminRole ], UserService.getAllUsers);
router.put('/users/:user_id', [AuthService.checkToken], UserService.updateUser);
router.delete('/users/:user_id', [AuthService.checkToken, AuthService.checkAdminRole], UserService.removeUser);
router.delete('/tokens/:user_id' , [AuthService.checkToken] , AuthService.removeToken );

/************************* Order API ***************************************/
router.post('/users/:user_id/orders',[AuthService.checkToken] , OrderService.addOrder );
router.get('/users/:user_id/orders/:order_id',[AuthService.checkToken] , OrderService.findOrder );
router.delete('/users/:user_id/orders/:order_id',[AuthService.checkToken] , OrderService.removeOrder );
router.put('/users/:user_id/orders/:order_id',[AuthService.checkToken] , OrderService.updateOrder );

/************************* Product API ***************************************/
router.get('/products', ProductService.getProducts);
router.post('/products',[AuthService.checkToken , AuthService.checkAdminRole], ProductService.addProduct);
router.put('/products/:product_id',[AuthService.checkToken, AuthService.checkAdminRole], ProductService.updateProduct );
router.delete('/products/:product_id',[AuthService.checkToken, AuthService.checkAdminRole], ProductService.removeProduct );


/************************* Place API ***************************************/
router.get('/places', PlaceService.getPlaces);
router.post('/places', [AuthService.checkToken] , PlaceService.addPlace);
router.put('/places/:place_id', [AuthService.checkToken] , PlaceService.updatePlace);
router.delete('/places/:place_id', [AuthService.checkToken] , PlaceService.removePlace);

module.exports = router;

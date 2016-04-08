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
router.post('/login', UserService.login);
router.get('/forget-password', UserService.forgetPassword);
router.get('/users', [AuthService.checkAdminRole], UserService.getAllUsers);
router.delete('/users/:user_id', [AuthService.checkAdminRole], UserService.removeUser);
router.put('/users/:user_id', [AuthService.checkToken], UserService.updateUser);
router.delete('/logout' , [AuthService.checkToken] , AuthService.removeToken );

/************************* Order API ***************************************/
router.post('/orders', [AuthService.checkAdminRole], OrderService.addOrder);
router.put('/orders/:order_id',[AuthService.checkAdminRole] , OrderService.updateOrder );
router.delete('/orders/:order_id',[AuthService.checkAdminRole] , OrderService.removeOrder );
router.post('/users/:user_id/orders',[AuthService.checkToken] , OrderService.addUserOrder );
router.get('/users/:user_id/orders/:order_id',[AuthService.checkToken] , OrderService.findUserOrder );
router.delete('/users/:user_id/orders/:order_id',[AuthService.checkToken] , OrderService.removeUserOrder );
router.put('/users/:user_id/orders/:order_id',[AuthService.checkToken] , OrderService.updateUserOrder );

/************************* Product API ***************************************/
router.get('/products', ProductService.getProducts);
router.post('/products',[AuthService.checkAdminRole], ProductService.addProduct);
router.put('/products/:product_id',[AuthService.checkAdminRole], ProductService.updateProduct );
router.delete('/products/:product_id',[AuthService.checkAdminRole], ProductService.removeProduct );


/************************* Place API ***************************************/
router.get('/places', PlaceService.getPlaces);
router.post('/places', [AuthService.checkAdminRole] , PlaceService.addPlace);
router.put('/places/:place_id', [AuthService.checkAdminRole] , PlaceService.updatePlace);
router.put('/places/:place_id', [AuthService.checkAdminRole] , PlaceService.removePlace);

module.exports = router;

var express = require('express');
var router = express.Router();
var User = require('../models/user');


//middleware to use for all requests.
router.use(function(req, res, next) {
    console.log('api is called.');
    next();
});

router.get('/', function(req, res) {
    res.json({
        message: 'welcome to use our api'
    });
});

router.route('/users')
    // create a user (accessed at POST http://localhost:3005/users)
    .post(function(req, res) {
        // create a instance of User model
        var user = new User();
        user.email = req.body.email;
        user.password = req.body.password;
        user.address = req.body.address;
        // save the user and check for errors
        user.save(function(err) {
        	console.log(err);
            if (err) {
                res.send(err);
            }
            res.json({
                message: 'User created!'
            });
        });
    })
    .get(function( req , res ){
    	User.find(function(err, users){
    		if(err){
    			res.send(err);
    		}
    		res.json(users);
    	});
    });

 router.route('/users/:user_id')
 	   // get the user with that id
 	   .get(function(req, res){
 	   		console.log(req.params);
 	   		User.findById(req.params.user_id,function(err ,user){
 	   			if(err){
 	   				console.log(err);
 	   				res.send(err);
 	   			}
 	   			res.json(user);
 	   		});
 	   });

module.exports = router;
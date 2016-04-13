process.env.NODE_ENV = 'test';

var supertest = require("supertest");
var should = require("should");
var expect = require('chai').expect;
var config = require("../config");
var mongoose = require('mongoose');
var app = require('../server');


var adminToken;
var userToken;
var userId;
var adminId;
var productId;

var server = supertest.agent("http://localhost:3005");


describe("create a user test", function() {
    it("should create a user", function(done) {
        var user = {
            email: 'ouyangwanbin@gmail.com',
            password: 'abc123'
        }
        server
            .post("/api/users")
            .send(user)
            .end(function(err, res) {
                res.body.status.should.equal('success');
                done();
            });
    });
});

describe("check existance of user", function() {
    it("should get the user", function(done) {
        var email = 'ouyangwanbin@gmail.com';
        server
            .get("/api/users/" + email)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    });
});

describe("authenticate user", function() {
    it("should get the user token", function(done) {
        var user = {
            email: 'ouyangwanbin@gmail.com',
            password: 'abc123'
        };
        server
            .post("/api/auth")
            .send(user)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                expect(res.body.data.token).exist;
                userToken = res.body.data.token;
                userId = res.body.data.user._id;
                console.log("userToken: " + userToken);
                done();
            });
    });

    it("should get the admin token", function(done) {
        var user = {
            email: 'wouyang@opentext.com',
            password: 'abc123'
        };
        server
            .post("/api/auth")
            .send(user)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                expect(res.body.data.token).exist;
                adminToken = res.body.data.token;
                adminId = res.body.data.user._id;
                console.log("adminToken: " + adminToken);
                done();
            });
    });
});

describe("get all users", function() {
    it("should not get the users because of lacking token on the request header", function(done) {
        server
            .get("/api/users")
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    });

    it("should not get the users because of it's not admin token on the request header", function(done) {
        server
            .get("/api/users")
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    });

    it("should get the users because of it's admin token on the request header", function(done) {
        server
            .get("/api/users")
            .set('token', adminToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    });
});

describe("create a product", function() {
    it("should not add, because it does not add any token on request header", function(done) {
        var product = {
            product_name: 'fish',
            product_price: 15.20,
            product_unit: 'lb',
            product_image: 'fish.jpg',
            product_description: 'this is good',
            product_quantity: 500
        };
        server
            .post('/api/products')
            .send(product)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should not add, because it is not an admin token", function(done) {
        var product = {
            product_name: 'fish',
            product_price: 15.20,
            product_unit: 'lb',
            product_image: 'fish.jpg',
            product_description: 'this is good',
            product_quantity: 500
        };
        server
            .post('/api/products')
            .set('token', userToken)
            .send(product)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should add, because it is an admin token", function(done) {
        var product = {
            product_name: 'shrimp',
            product_price: 12.20,
            product_unit: 'lb',
            product_image: 'shrimp.jpg',
            product_description: 'this is good',
            product_quantity: 200
        };
        server
            .post('/api/products')
            .set('token', adminToken)
            .send(product)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                done();
            });
    });
});

describe("get all products information", function() {
    it("should show all the products information without any authentication", function(done) {
        server
            .get('/api/products')
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                productId = res.body.data.products[0]._id;
                done();
            });
    });
});

describe("update product" , function( ){
	it("should not update, because it does not add any token on request header",function(done){
		server
			.put("/api/products/" + productId)
			.end(function(err, res){
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
			})
	});

	it("should not update, because the token is not admin token",function(done){
		server
			.put("/api/products/" + productId)
			.set('token', userToken)
			.end(function(err, res){
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
			})
	});

	it("should update, because the token is an admin token",function(done){
		var update = {
			product_name:"updatedName"
		}
		server
			.put("/api/products/" + productId)
			.set('token', adminToken)
			.send(update)
			.end(function(err, res){
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
			});
	});	
});

describe("delete product" , function( ){
	it("should not delete, because it does not add any token on request header",function(done){
		server
			.delete("/api/products/" + productId)
			.end(function(err, res){
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
			})
	});
	
	it("should not delete, because the token is not admin token",function(done){
		server
			.delete("/api/products/" + productId)
			.set('token', userToken)
			.end(function(err, res){
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
			})
	});
	
	it("should delete, because the token is an admin token",function(done){
		server
			.delete("/api/products/" + productId)
			.set('token', adminToken)
			.end(function(err, res){
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
			})
	});	
});

describe("update user", function() {
    it("should not update the user, because the token is missing", function(done) {
        var user = {
            email: 'ouyangwanbin@gmail.com',
            password: "123"
        }
        server
            .put("/api/users/" + userId)
            .send(user)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    });

    it("should update the user and change the password", function(done) {
        var user = {
            email: 'ouyangwanbin@gmail.com',
            password: 'abc123'
        }
        server
            .put("/api/users/" + userId)
            .send(user)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    });
});

describe("remove token" , function(){
	it("should remove the token for user when logout", function(done){
		server
			.delete("/api/tokens/" + userId)
			.set('token',userToken)
			.end(function( err, res ){
				res.status.should.equal(200);
				res.body.status.should.equal('success');
				done( );
			});
	});
});

describe("delete user", function() {
    it("should not delete the user, because the token is not admin token", function(done) {
        server
            .delete("/api/users/" + userId)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    });

    it("should delete the user, because the token is an admin token", function(done) {
        server
            .delete("/api/users/" + userId)
            .set('token', adminToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    });
});

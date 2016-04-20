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
var placeId;
var orderId;

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

describe("update product", function() {
    it("should not update, because it does not add any token on request header", function(done) {
        server
            .put("/api/products/" + productId)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            })
    });

    it("should not update, because the token is not admin token", function(done) {
        server
            .put("/api/products/" + productId)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            })
    });

    it("should update, because the token is an admin token", function(done) {
        var update = {
            product_name: "updatedName"
        }
        server
            .put("/api/products/" + productId)
            .set('token', adminToken)
            .send(update)
            .end(function(err, res) {
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

describe("create a place", function() {
    it("should not create a place, because the token is missing", function(done) {
        var place = {
            address: "San Mateo",
            time: "12:00 pm"
        }
        server
            .post("/api/places")
            .send(place)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    })

    it("should not create a place, because the token is not admin token", function(done) {
        var place = {
            address: "San Mateo",
            time: "12:00 pm"
        }
        server
            .post("/api/places")
            .set("token", userToken)
            .send(place)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    })

    it("should create a place, because the token is admin token", function(done) {
        var place = {
            address: "San Mateo",
            time: "12:00 pm"
        }
        server
            .post("/api/places")
            .set("token", adminToken)
            .send(place)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    })
})

describe("get all places", function() {
    it("should get all the places without any authentication", function(done) {
        server
            .get("/api/places")
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                placeId = res.body.data.places[0]._id;
                done();
            })
    })
})

describe("update place", function() {
    it("should not update place, because the token is missing", function(done) {
        var place = {
            address: "foster city",
            time: "9:00 am"
        }
        server
            .put("/api/places/" + placeId)
            .send(place)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            })
    })
    it("should not update place, because the token is not admin token", function(done) {
        var place = {
            address: "foster city",
            time: "9:00 am"
        }
        server
            .put("/api/places/" + placeId)
            .set("token", userToken)
            .send(place)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    })
    it("should update place, because the token is admin token", function(done) {
        var place = {
            address: "foster city",
            time: "9:00 am"
        }
        server
            .put("/api/places/" + placeId)
            .set("token", adminToken)
            .send(place)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    })
})

describe("delete place", function() {
    it("should not delete place, because the token is missing", function(done) {
        server
            .delete("/api/places/" + placeId)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            })
    })
    it("should not delete place, because the token is not admin token", function(done) {
        server
            .delete("/api/places/" + placeId)
            .set("token", userToken)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal('fail');
                done();
            });
    })
    it("should delete place, because the token is admin token", function(done) {
        server
            .delete("/api/places/" + placeId)
            .set("token", adminToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
            });
    })
})

describe("create an order", function() {
    it("should not create an order without token", function(done) {
        var order = {
            product_id: productId,
            order_num: 15,
            order_unit: 'lb',
            order_note: 'ddddd',
            place_id: placeId
        };
        server
            .post('/api/orders/' + userId)
            .send(order)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should not create an order without invalid token", function(done) {
        var order = {
            product_id: productId,
            order_num: 15,
            order_unit: 'lb',
            order_note: 'ddddd',
            place_id: placeId
        };
        server
            .post('/api/orders/' + userId)
            .set('token', 'dasdasdasdasdasdas')
            .send(order)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should create an order with valid token", function(done) {
        var order = {
            product_id: productId,
            order_num: 15,
            order_unit: 'lb',
            order_note: 'ddddd',
            place_id: placeId
        };
        server
            .post('/api/orders/' + userId)
            .set('token', userToken)
            .send(order)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                done();
            });
    });
});

describe("get orders of user", function() {
    it("should not get all the orders without token", function(done) {
        server
            .get('/api/orders/' + userId)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should not get all orders without invalid token", function(done) {
        server
            .get('/api/orders/' + userId)
            .set('token', 'dasdasdasdasdasdas')
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should get all orders with valid token", function(done) {
        server
            .get('/api/orders/' + userId)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                res.body.data.orders.length.should.be.above(0);
                orderId = res.body.data.orders[0]._id;
                done();
            });
    });

    it("should get one order from user with valid token", function(done) {
        server
            .get('/api/orders/' + userId + '/' + orderId)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                res.body.data.orders.length.should.equal(1);
                done();
            });
    });
});

describe("update orders of user", function() {
    it("should not update the orderswithout token", function(done) {
        var order = {
            product_id: productId,
            order_num: 100,
            order_note: 'dddsaa',
            place_id: placeId
        }
        server
            .put('/api/orders/' + userId + '/' + orderId)
            .send(order)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should not update orders without invalid token", function(done) {
        var order = {
            product_id: productId,
            order_num: 100,
            order_note: 'dddsaa',
            place_id: placeId
        }
        server
            .put('/api/orders/' + userId + '/' + orderId)
            .set('token', 'dasdasdasdasdasdas')
            .send(order)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should update order from user with valid token", function(done) {
        var order = {
            product_id: productId,
            order_num: 100,
            order_note: 'dddsaa',
            place_id: placeId
        }
        server
            .put('/api/orders/' + userId + '/' + orderId)
            .set('token', userToken)
            .send(order)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                done();
            });
    });
});

describe("delete order of user", function() {
    it("should not delete the orderswithout token", function(done) {
        server
            .delete('/api/orders/' + userId + '/' + orderId)
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should not delete order without invalid token", function(done) {
        server
            .delete('/api/orders/' + userId + '/' + orderId)
            .set('token', 'dasdasdasdasdasdas')
            .end(function(err, res) {
                res.status.should.equal(401);
                res.body.status.should.equal("fail");
                done();
            });
    });

    it("should delete order from user with valid token", function(done) {
        server
            .delete('/api/orders/' + userId + '/' + orderId)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal("success");
                done();
            });
    });
});


describe("update user", function() {
    it("should not update the user, because the token is missing", function(done) {
        var user = {
            email: "ouyangwanbin@gmail.com",
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



describe("remove token", function() {
    it("should remove the token for user when logout", function(done) {
        server
            .delete("/api/tokens/" + userId)
            .set('token', userToken)
            .end(function(err, res) {
                res.status.should.equal(200);
                res.body.status.should.equal('success');
                done();
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

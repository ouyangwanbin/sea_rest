process.env.NODE_ENV = 'test';

var supertest = require("supertest");
var should = require("should");
var config = require("../config");
var mongoose = require('mongoose');
var app = require('../server');


var server = supertest.agent("http://localhost:3005");

describe("create a user test", function() {
    it("should create a user", function(done) {
        var user = {
            email: 'wouyang@opentext.com',
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

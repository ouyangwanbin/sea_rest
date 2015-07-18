var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//set up database
mongoose.connect('mongodb://localhost:27017/sea');


//configure app to use bodyParser()
//this will let us get the data from a post

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var port = process.env.PORT || 3005;


// Register routes
// all of the /api calls
app.use('/api' , require('./routes/apiRoute') );

// error handle
app.use(function( err, req, res, next ){
	var result = {};
	if( res.status === 500 ){
		result.status = "error";
		result.msg = err.message || "server side error";
	}else if( res.status === 401){
		result.status = "fail";
		result.msg = err.message || "authenticate failed";
	}else if( res.status === 400){
		result.status = "fail";
		result.msg = err.message || "Can not find the resources";
	}	
	res.json( result );
});



app.listen(port);
console.log('listening on: ' + port);


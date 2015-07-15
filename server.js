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



app.listen(port);
console.log('listening on: ' + port);


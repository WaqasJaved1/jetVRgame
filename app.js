var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(session({
    secret: 'programmers always pay their depts',
    resave: false,
    saveUninitialized: true
}));



app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());



// start server on the specified port and binding host
app.listen(80, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("server starting on port" + 80);
});
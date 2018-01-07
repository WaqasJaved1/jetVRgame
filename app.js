var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');


var highest = [];
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

app.post("/newHighest", function(req, res) {
    highest.push(req.body);
    res.send("Done")
});


app.get("/leaderboard", function (req, res) {
	var high = JSON.parse(JSON.stringify(highest))
	high.sort(function(a, b) {
        var comparison = 0;
        if (a.score < b.score) {
            comparison = 1;
        } else if (b.score < a.score) {
            comparison = -1;
        }

        return b.score-a.score;
    });

    while(high.length > 10){
    	high.pop();
    }

    console.log(high);

	res.send(high);
})


app.get('/isHighest:score', function (req,res) {
	var high = JSON.parse(JSON.stringify(highest))
	high.sort(function(a, b) {
        var comparison = 0;
        if (a.score < b.score) {
            comparison = 1;
        } else if (b.score < a.score) {
            comparison = -1;
        }

        return comparison;
    });

    if(req.params.score > high[9].score){
    	high = true;
    }else{high = false;}

	res.send(high);	
})



highest.push({ 'name':'Waqas', 'score': 10 })
highest.push({ 'name':'Waqas','score': 20 })
highest.push({ 'name':'Waqas','score': 50 })
highest.push({ 'name':'Waqas','score': 5 })
highest.push({ 'name':'Waqas','score': 3 })
highest.push({ 'name':'Waqas','score': 2 })
highest.push({ 'name':'Waqas','score': 10 })
highest.push({ 'name':'Waqas','score': 20 })
highest.push({ 'name':'Waqas','score': 50 })
highest.push({ 'name':'Waqas','score': 5 })
highest.push({ 'name':'Waqas','score': 3 })
highest.push({ 'name':'Waqas','score': 2 })
highest.push({ 'name':'Waqas','score': 10 })
highest.push({ 'name':'Waqas','score': 20 })
highest.push({ 'name':'Waqas','score': 50 })
highest.push({ 'name':'Waqas','score': 5 })
highest.push({ 'name':'Waqas','score': 3 })
highest.push({ 'name':'Waqas','score': 2 })
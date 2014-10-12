"use strict";

// Main nodejs entry point

// run "npm install" to install all dependencies
// see config.js for configuration

// Run server by using:
//  node ./src/server.js
// or to redirect console to file:
//  node ./src/server.js >> log.txt 2>&1

var express    = require("express");
var bodyParser = require("body-parser");
var morgan  = require("morgan");
var fs = require("fs");
var markdown = require("markdown").markdown;

var config = require("./config.js");
var searchCrawler = require("./searchCrawler.js");
var errorHandling = require("./expressErrorHandling.js");

var app = express();

// express requests logger
app.use(morgan('tiny')); 

// express views
//app.set('views', __dirname + '/views');

app.set('view engine', 'html');

// express body parser (to handle json)
app.use(bodyParser());

// express static files
app.use(express.static(__dirname + '/ui'));
app.use(express.static(__dirname + '/../public'));


// get README.md
app.get('/readme', function(req, res){
    fs.readFile('README.md', {encoding: 'utf-8'}, function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(markdown.toHTML(page));
        res.end();
    });
});


// API routes
require("./api.js").init(app);


errorHandling.init(app);


searchCrawler.init()
.then(function() {
		app.listen(config.web.port, config.web.ip);

		console.log("search-crawler running...");
})
.fail(function(error){
		console.error(error);
});


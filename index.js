"use strict";

// Main nodejs entry point

// run "npm install" to install all dependencies
// see config.js for configuration

// Run server by using:
//  node ./index.js
// or to redirect console to file:
//  node ./index.js >> log.txt 2>&1
// or to autorestarting it when something change use
//  nodemon ./index.js

var express    = require("express");
var bodyParser = require("body-parser");
var morgan  = require("morgan");
var fs = require("fs");
var markdown = require("markdown").markdown;

var config = require("./src/config.js");
var searchCrawler = require("./src/searchCrawler.js");
var errorHandling = require("./src/expressErrorHandling.js");

var app = express();

// express requests logger
if (config.web.logRequests){
  app.use(morgan('tiny'));
}

// express views
//app.set('views', __dirname + '/views');

app.set('view engine', 'html');

// express body parser (to handle json)
app.use(bodyParser());

// express static files
app.use(express.static(__dirname + '/src/ui'));
app.use(express.static(__dirname + '/public'));


// get README.md
app.get('/readme', function(req, res){
    fs.readFile('README.md', {encoding: 'utf-8'}, function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(markdown.toHTML(page));
        res.end();
    });
});


// API routes
require("./src/api.js").init(app);


errorHandling.init(app);


searchCrawler.init()
.then(function() {

		app.listen(config.web.port, config.web.ip);

		console.log("search-crawler running...");
})
.fail(function(error){
		console.error(error);
});

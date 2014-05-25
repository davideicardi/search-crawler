
// run "npm install" to install all dependencies
// see config.js for configuration

var express    = require('express');
var bodyParser = require('body-parser');
var crawler = require("./crawler.js");
var config = require("./config.js");

var app = express();

app.use(bodyParser());

app.get('/', function(req, res){
    res.send('Search engine');
});

app.post('/crawl', function(req, res){
  
    console.log("Request to crawl " + req.body.url);

    crawler.crawl(req.body.url, function(url, responseBuffer , response){
            // TODO
            console.log("Parsing " + url);
        });
  
    res.send('OK: Crawling in progress...');
});

app.listen(config.web.port);

console.log("search-crawler running...");

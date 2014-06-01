
// run "npm install" to install all dependencies
// see config.js for configuration

var express    = require('express');
var bodyParser = require('body-parser');
var crawler = require("./crawler.js");
var config = require("./config.js");
var parser = require("./parser.js");
var database = require("./database.js");

var app = express();

app.use(bodyParser());


var errorPage = function(res, err){
    res.json(err);
};

app.get('/', function(req, res){
    res.send('Search engine');
});

app.post('/crawl', function(req, res){
  
    console.log("Request to crawl " + req.body.url);

    crawler.crawl(req.body.url, function(url, htmlContent){
            // TODO
            console.log("Parsing " + url);
            
            var result = parser.parse(htmlContent);
            
            console.log("   Title " + result.pageTitle);
        });
  
    res.send('OK: Crawling in progress...');
});

app.post('/create-site', function(req, res){
    
    var site = { url: req.body.url, name: req.body.name};
    
    console.log("Creating site " + site.name + " at url " + site.url);

    database.createSite(site, function(inserted){
        res.json(site);
    },
    function(error){
        errorPage(res, error);
    });
});

app.get('/sites', function(req, res){
    
    database.getSites(function(result){
        res.json(result);
    },
    function(error){
        errorPage(res, error);
    });
});

database.init(function() {
    app.listen(config.web.port);
    
    console.log("search-crawler running...");
});


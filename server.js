
//run "npm install" to install all dependencies
//see config.js for configuration

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

// site

app.post('/create-site', function(req, res){

    var site = req.body;

    console.log("Creating site " + site.name + " at url " + site.url);

    database.createSite(site)
    .then(function(inserted){
        res.json(inserted);
    })
    .fail(function(error){
        errorPage(res, error);
    });
});

app.post('/remove-site', function(req, res){

    var site = req.body;

    console.log("Removing site " + site.name + "-" + site._id);

    database.removeSite(site)
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorPage(res, error);
    });
});

app.get('/sites', function(req, res){

    database.getSites()
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorPage(res, error);
    });
});


// pages

app.post('/register-page', function(req, res){

    var url = req.body.url;
    var siteName = req.body.siteName;
    
    console.log("Registering page " + url + " for site " + siteName);

    crawler.getPage(url)
    .then(function(htmlContent){
        var page = parser.parse(htmlContent);

        page.url = url;
        
        return database.insertPage(page, siteName);
    })
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorPage(res, error);
    });
});

app.get('/search', function(req, res){

    var queryExpression = req.query.q;
    var siteName = req.query.site;
    
    
    database.searchPages(queryExpression, siteName)
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorPage(res, error);
    });
});

database.init()
.then(function() {
    app.listen(config.web.port);

    console.log("search-crawler running...");
})
.fail(function(error){
    console.log(error);
});



//run "npm install" to install all dependencies
//see config.js for configuration

var express    = require('express');
var bodyParser = require('body-parser');

var crawler = require("./crawler.js");
var config = require("./config.js");
var parser = require("./parser.js");
var database = require("./database.js");

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

var errorPage = function(res, err){
    res.json(err);
};

app.get('/', function(req, res){
    res.render('index', { title : 'Home' });
});

// site

app.post('/create-site', function(req, res){

    var site = req.body;

    console.log("Creating site " + site.name + " at url " + site.url);

    database.insertSite(site)
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

app.post('/crawl-site', function(req, res){

    var siteName = req.body.siteName;
    
    console.log("Request to crawl site " + siteName);
    
    database.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Invalid site " + siteName);
        }
        
        return database.removePages(siteName)
        .then(function(){

            crawler.crawl(site.url, function(url, htmlContent){
                console.log("Parsing " + url);

                var page = parser.parse(htmlContent);
                page.url = url;
                
                database.insertPage(page, siteName)
                .fail(function(error){
                    console.log("Error inserting page " + error);
                });
            });
            
            return true;
        })
        .fail(function(error){
            console.log("Error removing pages " + error);
        });
    })
    .then(function(){
        res.send('OK: Crawling in progress...');
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
    var limit = parseInt(req.query.limit);
    
    database.searchPages(queryExpression, siteName, limit)
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


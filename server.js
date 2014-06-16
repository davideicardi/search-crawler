// Main nodejs entry point

// run "npm install" to install all dependencies
// see config.js for configuration

var express    = require('express');
var bodyParser = require('body-parser');
var swig = require('swig');

var crawler = require("./crawler.js");
var config = require("./config.js");
var parser = require("./parser.js");
var database = require("./database.js");
var errorHandling = require("./expressErrorHandling.js");

var app = express();

app.set('views', __dirname + '/views');

app.engine('html', swig.renderFile);
app.set('view engine', 'html');

app.use(bodyParser());

app.use(express.static(__dirname + '/public'));

// home page
app.get('/', function(req, res){
    res.render('index', { });
});


// API

// Site List
app.get('/api/sites', function(req, res){

    database.getSites()
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Get
app.get('/api/sites/:siteName', function(req, res){

    var siteName = req.param("siteName");
    
    database.getSite(siteName)
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Create
app.post('/api/sites', function(req, res){

    var site = req.body;

    console.log("Creating site " + site.name + " at url " + site.url);

    database.insertSite(site)
    .then(function(inserted){
        res.json(inserted);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Update Config
app.post('/api/sites/:siteName/update-config', function(req, res){

    var newConfig = req.body;
    var siteName = req.param("siteName");

    console.log("Update site " + siteName + " config");

    database.updateSiteConfig({ name: siteName, config: newConfig })
    .then(function(updated){
        res.json(updated);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Delete
app['delete']('/api/sites/:siteName', function(req, res){

    var siteName = req.param("siteName");

    console.log("Removing site " + siteName);

    database.removeSite({name:siteName})
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Crawl
app.post('/api/sites/:siteName/crawl', function(req, res){

    var siteName = req.param("siteName");
    
    console.log("Request to crawl site " + siteName);
    
    database.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Invalid site " + siteName);
        }
        
        return database.removePages(siteName)
        .then(function(){

            crawler.crawl(site.url, site.config, function(url, htmlContent){
                console.log("Parsing " + url);

                var page = parser.parse(htmlContent, site.config);
                page.url = url;
                
                database.insertPage(page, siteName)
                .fail(function(error){
                    console.log("Error inserting page " + error);
                });
            });
            
            return true;
        });
    })
    .then(function(){
        res.send('OK: Crawling in progress...');
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Register Page
app.post('/api/sites/:siteName/register-page', function(req, res){

    var url = req.body.url;
    var siteName = req.param("siteName");
    
    console.log("Registering page " + url + " for site " + siteName);

    database.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Invalid site " + siteName);
        } 
        
        database.removePage({url:url}, siteName)
        .then(function(){
    
            return crawler.getPage(url)
            .then(function(htmlContent){
                var page = parser.parse(htmlContent, site.config);
        
                page.url = url;
                
                return database.insertPage(page, siteName);
            });
        });
    })
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

// Site Remove Pages
app.post('/api/sites/:siteName/remove-pages', function(req, res){

    var siteName = req.param("siteName");
    
    console.log("Removing all pages for " + siteName);

    return database.removePages(siteName)
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

app.get('/api/sites/:siteName/page-count', function(req, res){

    var siteName = req.param("siteName");
    
    database.sitePageCount(siteName)
    .then(function(result){
        res.json({value:result});
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });    
});


// Search
app.get('/api/sites/:siteName/search', function(req, res){

    var siteName = req.param("siteName");
    var queryExpression = req.query.q;
    var limit = parseInt(req.query.limit);
    
    database.searchPages(queryExpression, siteName, limit)
    .then(function(result){
        res.json(result);
    })
    .fail(function(error){
        errorHandling.renderError(res, error);
    });
});

errorHandling.init(app);

database.init()
.then(function() {
    app.listen(config.web.port);

    console.log("search-crawler running...");
})
.fail(function(error){
    console.log(error);
});


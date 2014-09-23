// Main nodejs entry point

// run "npm install" to install all dependencies
// see config.js for configuration

// Run server by using:
//  node server.js
// or to redirect console to file:
//  node server.js >> log.txt 2>&1

var express    = require('express');
var bodyParser = require('body-parser');
var morgan  = require('morgan');
var fs = require('fs');
var markdown = require( "markdown" ).markdown;

var crawler = require("./crawler.js");
var config = require("./config.js");
var parser = require("./parser.js");
var database = require("./database2.js");
var errorHandling = require("./expressErrorHandling.js");

var app = express();

// express requests logger
app.use(morgan('tiny')); 

// express views
app.set('views', __dirname + '/views');

app.set('view engine', 'html');

// express body parser (to handle json)
app.use(bodyParser());

// express static files
app.use(express.static(__dirname + '/public'));


// get README.md
app.get('/readme', function(req, res){
    fs.readFile('README.md', {encoding: 'utf-8'}, function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(markdown.toHTML(page));
        res.end();
    });
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

	database.insertSite(site)
	.then(function(inserted){
		console.log(inserted);
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

		database.removeSite(siteName)
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
		
		database.getSite(siteName)
		.then(function(site){
				if (!site) {
						throw new Error("Invalid site " + siteName);
				}
				
				return database.removePages(siteName)
				.then(function(){

						crawler.crawl(site.url, site.config, function(url, htmlContent){
								var page = parser.parse(htmlContent, site.config);
								page.url = url;
								
								database.insertPage(page, siteName)
								.fail(function(error){
										console.warn("Error inserting page " + error);
								});
						},
						function(){
								database.updateSiteStatus({name:siteName, status:'crawling'});
						},
						function(){
								database.updateSiteStatus({name:siteName, status:'ready'});
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

	console.log("Registering page: " + url);

	database.getSite(siteName)
	.then(function(site){
			if (!site) {
					throw new Error("Invalid site " + siteName);
			} 
				
			return database.removePage({url:url}, siteName)
			.then(function(){
		
					return crawler.getPage(url)
					.then(function(htmlContent){
							var page = parser.parse(htmlContent, site.config);
				
							page.url = url;

							console.log("Inserting page " + url);

							return database.insertPage(page, siteName);
					});
			});
	})
	.then(function(result){
		console.log("Page registered: " + url);
		res.json(result);
	})
	.fail(function(error){
			errorHandling.renderError(res, error);
	});
});

// Site Remove Pages
app.post('/api/sites/:siteName/remove-pages', function(req, res){

		var siteName = req.param("siteName");
		
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
	var queryExpression = req.query.q || req.query.query;
	var limit = parseInt(req.query.l || req.query.limit);

	database.searchPages(siteName, queryExpression, limit)
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
		app.listen(config.web.port, config.web.ip);

		console.log("search-crawler running...");
})
.fail(function(error){
		console.error(error);
});


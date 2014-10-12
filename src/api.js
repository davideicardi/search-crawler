"use strict";

var searchCrawler = require("./searchCrawler.js");
var errorHandling = require("./expressErrorHandling.js");


function init(app){
  
    // Site List
    app.get('/api/sites', function(req, res){
    
		searchCrawler.getSites()
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
		
		searchCrawler.getSite(siteName)
		.then(function(result){
			res.json(result);
		})
		.fail(function(error){
			errorHandling.renderError(res, error);
		});
    });
    
    // Site Get Pages
    app.get('/api/sites/:siteName/pages', function(req, res){
    
		var siteName = req.param("siteName");
		
		searchCrawler.getPages(siteName)
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
    
    	searchCrawler.insertSite(site)
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

		searchCrawler.updateSiteConfig(siteName, newConfig )
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

		searchCrawler.removeSite(siteName)
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
		
		searchCrawler.crawlSite(siteName)
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
    
    	searchCrawler.registerPage(siteName, url)
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
    		
    		searchCrawler.removePages(siteName)
    		.then(function(result){
				res.json(result);
    		})
    		.fail(function(error){
				errorHandling.renderError(res, error);
    		});
    });
    
    // Site page count
    app.get('/api/sites/:siteName/page-count', function(req, res){
    
    		var siteName = req.param("siteName");
    		
    		searchCrawler.sitePageCount(siteName)
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
    
    	searchCrawler.searchPages(siteName, queryExpression, limit)
    	.then(function(result){
			res.json(result);
    	})
    	.fail(function(error){
			errorHandling.renderError(res, error);
    	});
    });

    
};

exports.init = init;
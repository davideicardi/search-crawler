var crawler = require("./crawler.js");
var parser = require("./parser.js");
var database = require("./database2.js");
var errorHandling = require("./expressErrorHandling.js");


function init(app){
  
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
    
    // Site Get Pages
    app.get('/api/sites/:siteName/pages', function(req, res){
    
    		var siteName = req.param("siteName");
    		
    		database.getPages(siteName)
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
    
    		database.updateSiteConfig(siteName, newConfig )
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
    								
    								database.insertPage(siteName, page)
    								.fail(function(error){
    										console.warn("Error inserting page " + error);
    								});
    						},
    						function(){
    								database.updateSiteStatus(siteName, 'crawling');
    						},
    						function(){
    								database.updateSiteStatus(siteName, 'ready');
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
    				
    			return database.removePage(siteName, url)
    			.then(function(){
    		
    					return crawler.getPage(url)
    					.then(function(htmlContent){
    							var page = parser.parse(htmlContent, site.config);
    				
    							page.url = url;
    
    							console.log("Inserting page " + url);
    
    							return database.insertPage(siteName, page);
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
    
    	console.log("SEARCH: Searching for '" + queryExpression + "' top " + limit + " in " + siteName);
    
    	database.searchPages(siteName, queryExpression, limit)
    	.then(function(result){
    			res.json(result);
    	})
    	.fail(function(error){
    			errorHandling.renderError(res, error);
    	});
    });

    
};

exports.init = init;
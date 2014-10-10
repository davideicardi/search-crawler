var mongoose = require('./mongoose-q.js');

var crawler = require("./crawler.js");
var parser = require("./parser.js");

var PageModel = require('./pageModel.js');
var SiteModel = require('./siteModel.js');

var config = require("./config.js");


function init() {
	console.log("Connecting to mongo database...");

	return mongoose.connectQ(config.db.mongo.url)
		.then(function() {
			console.log("Mongo database connected.");
		});
}


function getSites() {
	return SiteModel.appFindAll();
}
function getSite(name) {
		return SiteModel.appGet(name);
}
function sitePageCount(siteName){
	return SiteModel.appGet(siteName)
		.then(function(site){
				return site.appCountPages();
		});
}
function getPages(siteName){
	return SiteModel.appGet(siteName)
		.then(function(site){
				return site.appGetPages();
		});
}

function insertSite(site){
	return SiteModel.appInsert(site);
}

function updateSiteConfig(siteName, config){
	return SiteModel.appGet(siteName)
		.then(function(site){
			site.config = config;
			return site.appUpdate();
		});
}

function updateSiteStatus(siteName, status){
	return SiteModel.appGet(siteName)
		.then(function(site){
			site.status = status;
			return site.appUpdate();
		});
}

function removeSite(siteName){
  return SiteModel.appGet(siteName)
		.then(function(site){
      return site.appDelete();
    });
}

function removePage(siteName, pageUrl){
  return SiteModel.appGet(siteName)
		.then(function(site){
			return site.appDeletePage(pageUrl);
		});
}

function removePages(siteName){
  return SiteModel.appGet(siteName)
		.then(function(site){
			return site.appDeletePages();
		});
}

function insertPage(siteName, page){
  return SiteModel.appGet(siteName)
		.then(function(site){
			return site.appInsertPage(page);
		});
}

function registerPage(siteName, pageUrl){

	console.log("Registering page: " + pageUrl);

    return SiteModel.appGet(siteName)
    	.then(function(site){
			return removePage(siteName, pageUrl)
				.then(function(){
						return site;
					});
			})
    	.then(function(site){
			return crawler.getPage(pageUrl)
				.then(function(htmlContent){
					var page = parser.parse(htmlContent, site.config);
		
					page.url = pageUrl;

					console.log("Page " + pageUrl + " registered!");

					return insertPage(siteName, page);
				});
			});

}

function crawlSite(siteName) {
	return SiteModel.appGet(siteName)
		.then(function(site){
			return removePages(siteName)
				.then(function(){
					crawler.crawl(site.url, site.config, function(url, htmlContent){
						var page = parser.parse(htmlContent, site.config);
						page.url = url;
						
						insertPage(siteName, page)
						.fail(function(error){
							console.warn("Error inserting page " + error);
						});
					},
					function(){
						updateSiteStatus(siteName, 'crawling');
					},
					function(){
						updateSiteStatus(siteName, 'ready');
					});
					
					return true;
				});
		}); 
}

function searchPages(siteName, expression, limit) {

	if (typeof expression !== "string") {
		throw new Error("expression required");
	}

	console.log("SEARCH: Searching for '" + expression + "' limit " + limit + " in " + siteName);

	return SiteModel.appGet(siteName)
		.then(function(site){

			return site.appSearchPages(expression, limit);
		}); 
}


exports.init = init;
exports.getSites = getSites;
exports.getSite = getSite;
exports.sitePageCount = sitePageCount;
exports.insertSite = insertSite;
exports.updateSiteConfig = updateSiteConfig;
exports.updateSiteStatus = updateSiteStatus;
exports.removeSite = removeSite;
exports.removePage = removePage;
exports.removePages = removePages;
exports.getPages = getPages;
exports.insertPage = insertPage;
exports.registerPage = registerPage;
exports.crawlSite = crawlSite;
exports.searchPages = searchPages;
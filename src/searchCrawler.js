"use strict";

var mongoose = require('mongoose-promised');
var Q = require('q');

var crawler = require("./crawler.js");
var parser = require("./parser.js");

var PageModel = require('./pageModel.js');
var SiteModel = require('./siteModel.js');

var scheduler = require("./scheduler.js");

var config = require("./config.js");

function init() {
	console.log("Connecting to mongo database...");

	return mongoose.connectQ(config.db.mongo.url)
		.then(function() {
			console.log("Mongo database connected.");
		})
		.then(function() {
			return loadJobs();
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

function updateSiteStatus(siteName, status, lastCrawled){
	return SiteModel.appGet(siteName)
		.then(function(site){
			site.status = status;
			if (lastCrawled){
				site.lastCrawled = lastCrawled;
			}
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
						updateSiteStatus(siteName, 'ready', Date.now());
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

var siteJobs;

function loadJobs() {

	return unloadJobs()
		.then(function(){

			siteJobs = getSites()
			.then(function(sites){

				var jobs = [];

				sites.forEach(function(site) {

					if (!site.config.crawlingCron){
						return;
					}

					var job = scheduler.createJob(site.config.crawlingCron, function(){
						console.log("Running job for " + site.name);

						crawlSite(site.name);
					});

					job.start();

					jobs.push({
						siteName: site.name,
						cronExpression: job.cronTime.source,
						job: job });
					});

					return jobs;
				});

				return getJobs();

		});
}

function unloadJobs() {
	if (siteJobs){
		return siteJobs
			.then(function(jobs) {
			jobs.forEach(function(job){
				job.job.stop();
			});

			siteJobs = Q([]);

			return getJobs();
		});
	}
	else {
		return Q([]);
	}
}

function getJobs() {
	return siteJobs
		.then(function(jobs){
			return jobs.map(function(j){
				return { siteName: j.siteName, cronExpression: j.cronExpression};
			});
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
exports.loadJobs = loadJobs;
exports.unloadJobs = unloadJobs;
exports.getJobs = getJobs;

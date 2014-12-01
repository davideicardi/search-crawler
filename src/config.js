"use strict";

var config = {};

config.crawler = {};
config.db = {};
config.parser = {};
config.web = {};

// Excluded extensions for crawling
//config.crawler.excludedUrlPatterns = [
//		"\\.(pdf|js|css|zip|docx|jpg|png|gif|woff|xml|rss)$"
//		];
// Allowed extension for crawling
config.crawler.allowedUrlPatterns = [
		"/[^./]*$" // extension less
		,"\\.(html|htm|aspx|php)$" // .html + .htm
		];
// List of content types to process
config.crawler.contentTypes = ["text/html"];
// crawler interval
config.crawler.interval = 300;
// crawler maxConcurrency
config.crawler.maxConcurrency = 2;
config.crawler.timeout = 20 * 1000; // 20 sec
config.crawler.maxResourceSize = 1024 * 1024 * 1; // 1mb

// mongo host and database (mongodb version => 2.6 required)
config.db.mongo = {};
config.db.mongo.ip = process.env.IP || "localhost";
config.db.mongo.url = "mongodb://" + config.db.mongo.ip + ":27017/search-crawler";


// html "jquery style" selector for the body content (es. "body", "article", "div#text")
//  can be override on each site
config.parser.defaultContentSelector = "body";

// nodejs server listening port
config.web.port = process.env.PORT || process.env.WEB_PORT || 8181;
config.web.ip = process.env.IP;

config.web.logRequests = false;

module.exports = config;

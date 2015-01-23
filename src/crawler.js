"use strict";

var SimpleCrawler = require("simplecrawler");
var http = require('http');
var URI = require("URIjs");
var Q = require("q");

var config = require("./config.js"); 

var isValidContentType = function(contentType){
  var i;
  for (i = 0; i < config.crawler.contentTypes.length; i++){
      var validType = config.crawler.contentTypes[i];
      if (contentType.indexOf(validType) > -1){
          return true;
      }
  }
  
  return false;
};

var isValidUrl = function(parsedURL, siteConfig){

    if (config.crawler.excludedUrlPatterns) {
        var i;
        for (i = 0; i < config.crawler.excludedUrlPatterns.length; i++){
            var pattern = new RegExp(config.crawler.excludedUrlPatterns[i], "i");
            if (pattern.test(parsedURL.uriPath)) {
                console.log("CRAWLER: Skipping " + parsedURL.uriPath);
                return false;
            }
        }
    }

    if (config.crawler.allowedUrlPatterns) {
        var foundAllowed = false;
        var i;
        for (i = 0; i < config.crawler.allowedUrlPatterns.length; i++){
            var pattern = new RegExp(config.crawler.allowedUrlPatterns[i], "i");
            if (pattern.test(parsedURL.uriPath)) {
                foundAllowed = true;
            }
        }

        if (!foundAllowed){
            console.log("CRAWLER: Skipping not allowed url " + parsedURL.uriPath);
            return false;
        }
    }
    
    if (siteConfig && siteConfig.urlPattern){
        var sitePatternRegExp = new RegExp(siteConfig.urlPattern);
        var currentUri = new URI({
                      protocol: parsedURL.protocol, 
                      hostname: parsedURL.host,
                      port: parsedURL.port.toString(),
                      path: parsedURL.path
                    })
                    .normalizePort()
                    .normalizePath();
        
        var currentUriString = currentUri.toString();
        if (!sitePatternRegExp.test(currentUriString)) {
            console.log("CRAWLER: Skipping not in site url " + parsedURL.uriPath);
            return false;
        }
    }
    
    return true;
};


exports.crawl = function(urlToCrawl, siteConfig, processPage, crawlingStarted, crawlingCompleted){
  
    var url = URI(urlToCrawl);

    if (!url.protocol())
        throw new Error("Can't crawl with unspecified protocol.");
    if (!url.hostname())
        throw new Error("Can't crawl with unspecified hostname.");
    if (!url.path())
        throw new Error("Can't crawl with unspecified path.");

    var simpleCrawlerInstance = new SimpleCrawler(url.hostname(), url.path(), url.port() || 80);
    
    simpleCrawlerInstance.interval = config.crawler.interval;
    simpleCrawlerInstance.maxConcurrency = config.crawler.maxConcurrency;
    simpleCrawlerInstance.timeout = config.crawler.timeout;
    simpleCrawlerInstance.maxResourceSize = config.crawler.maxResourceSize;
    simpleCrawlerInstance.customHeaders = config.crawler.customHeaders;
    
    // extract only anchor with href
    simpleCrawlerInstance.discoverRegex = [
        /(\shref\s?=\s?)([^\"\'\s>\)]+)/ig,
        /(\shref\s?=\s?)['"]([^"']+)/ig
    ];

    simpleCrawlerInstance.addFetchCondition(function(parsedURL) {
        return isValidUrl(parsedURL, siteConfig);
    });
    
    simpleCrawlerInstance.on("crawlstart",function() {
        console.log("Crawl starting...");
        crawlingStarted();
    });

    simpleCrawlerInstance.on("complete",function() {
        console.log("Crawl finished!");
        crawlingCompleted();
    });

    simpleCrawlerInstance.on("fetchcomplete",function(queueItem, responseBuffer, response){
        
            if (!isValidContentType(response.headers["content-type"])){
                return;
            }
        
            console.log("Processing " + queueItem.url);

            processPage(queueItem.url, responseBuffer.toString('utf-8'));
        });
  
    simpleCrawlerInstance.on("fetcherror",function(queueItem, response){
        console.warn("Error processing " + queueItem.url);
    });
    simpleCrawlerInstance.on("fetch404",function(queueItem, response){
        console.warn("Error 404 processing " + queueItem.url);
    });
    simpleCrawlerInstance.on("fetchclienterror",function(queueItem, errorData){
        console.warn("Error processing " + queueItem.url);
    });
    
    simpleCrawlerInstance.start();    
};

exports.getPage = function(pageUrl){
    var url = URI(pageUrl);

    if (!url.protocol())
        throw new Error("Can't get with unspecified protocol.");
    if (!url.hostname())
        throw new Error("Can't get with unspecified hostname.");
    if (!url.path())
        throw new Error("Can't get with unspecified path.");
    
    var options = {
            host: url.hostname(),
            path: url.path(),
            port: url.port() || 80
          };

    var deferred = Q.defer();
    
    var callback = function(response) {
        var buffer = '';
    
        response.on('data', function (chunk) {
            buffer += chunk;
        });
    
        response.on('end', function () {
            deferred.resolve(buffer);
        });
      };
    
    http.request(options, callback).end();

    return deferred.promise;
};

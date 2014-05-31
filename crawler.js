var SimpleCrawler = require("simplecrawler");
var URI     = require("URIjs");
var config = require("./config.js"); 

exports.crawl = function(urlToCrawl, processPage){
  
    var url = URI(urlToCrawl);

    if (!url.protocol())
        throw new Error("Can't crawl with unspecified protocol.");
    if (!url.hostname())
        throw new Error("Can't crawl with unspecified hostname.");
    if (!url.path())
        throw new Error("Can't crawl with unspecified path.");

    var simpleCrawlerInstance = new SimpleCrawler(url.hostname(), url.path(), url.port() || 80);
    
    simpleCrawlerInstance.interval = 300;
    simpleCrawlerInstance.maxConcurrency = 1;
    
    simpleCrawlerInstance.addFetchCondition(function(parsedURL) {
        
        var excludedRegExp = new RegExp("\.(" + config.crawler.excludedExtensions + ")$", "i");
        
        return !parsedURL.path.match(excludedRegExp);
    });
    
    simpleCrawlerInstance.on("crawlstart",function() {
        console.log("Crawl starting...");
    });

    simpleCrawlerInstance.on("complete",function() {
        console.log("Crawl finished!");
    });

    simpleCrawlerInstance.on("fetchcomplete",function(queueItem, responseBuffer , response){
            
            console.log("Processing " + queueItem.url);

            processPage(queueItem.url, responseBuffer.toString('utf-8'));
        });
  
    simpleCrawlerInstance.on("fetcherror",function(queueItem, response){
        console.log("Error processing " + queueItem.url);
    });
    simpleCrawlerInstance.on("fetch404",function(queueItem, response){
        console.log("Error 404 processing " + queueItem.url);
    });
    simpleCrawlerInstance.on("fetchclienterror",function(queueItem, errorData){
        console.log("Error processing " + queueItem.url);
    });
    
    simpleCrawlerInstance.start();    
};

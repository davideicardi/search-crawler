var config = {};

config.crawler = {};
config.db = {};
config.parser = {};
config.web = {};

// Excluded extensions for crawling
config.crawler.excludedExtensions = "pdf|js|css|zip|docx|jpg|png|gif|woff|xml|rss";
// List of content types to process
config.crawler.contentTypes = ["text/html"];

// mongo host and database
config.db.mongo = {};
config.db.mongo.url = "mongodb://localhost:27017/search-crawler";

// html "jquery style" selector for the body content
config.parser.contentSelector = "body";

// nodejs server listening port
config.web.port = process.env.WEB_PORT || 8181;

module.exports = config;
var config = {};

config.crawler = {};
config.web = {};
config.db = {};

config.crawler.excludedExtensions = "pdf|js|css|zip|docx|jpg|png|gif|woff";

config.web.port = process.env.WEB_PORT || 8181;

config.db.mongo = {};
config.db.mongo.url = "mongodb://localhost:27017/search-crawler";

module.exports = config;
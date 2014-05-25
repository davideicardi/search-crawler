var config = {};

config.crawler = {};
config.web = {};

config.crawler.excludedExtensions = "pdf|js|css|zip|docx|jpg|png|gif|woff";

config.web.port = process.env.WEB_PORT || 8181;

module.exports = config;
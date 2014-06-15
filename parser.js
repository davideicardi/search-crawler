var cheerio = require('cheerio');

var config = require("./config.js"); 

exports.parse = function(htmlContent, siteConfig){
    
    $ = cheerio.load(htmlContent);

    
    var result = {};
    
    result.title = $('head title').text() || "no-title";
    result.description = $('meta[name="description"]').attr('content') || result.title;
    
    var contentSelector = siteConfig.contentSelector || config.parser.contentSelector || 'article';
    result.body = $(contentSelector).text();
    
    return result;
};

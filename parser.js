var cheerio = require('cheerio');

exports.parse = function(htmlContent){
    
    $ = cheerio.load(htmlContent);

    
    var result = {};
    
    result.pageTitle = $('html head title').text();
    
    return result;
};

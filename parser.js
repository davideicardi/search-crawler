var cheerio = require('cheerio');

exports.parse = function(htmlContent){
    
    $ = cheerio.load(htmlContent);

    
    var result = {};
    
    result.title = $('html head title').text();
    result.description = "";
    result.body = $('html body').text();;
    
    return result;
};

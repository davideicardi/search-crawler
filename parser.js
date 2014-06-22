var cheerio = require('cheerio');

var config = require("./config.js"); 

var parseKeywords = function (metaKeywords) {
	var keywords = [];

	var parts = metaKeywords.split(",");
	var i;
	for (i = 0; i < parts.length; i++) {
		var keyword = parts[i].trim();
		if (keyword.length > 0) {
			keywords.push(keyword);
		}
	}

	return keywords;
};

exports.parse = function(htmlContent, siteConfig){
	$ = cheerio.load(htmlContent);
		
	var result = {};
		
	result.title = $("head title").text() || "no-title";
	result.title = result.title.trim();

	result.description = $("head meta[name='description']").attr("content") || result.title;
	result.description = result.description.trim();

	var metaKeywords = $("head meta[name='keywords']").attr("content") || "";
	result.keywords = parseKeywords(metaKeywords);

	var contentSelector = siteConfig.contentSelector || config.parser.defaultContentSelector;
	result.body = $(contentSelector).text();
	
	console.log("Page parsed : " + result.title);

	return result;
};

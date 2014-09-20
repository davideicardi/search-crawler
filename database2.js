var mongoose = require('./mongoose-q.js');


var PageModel = require('./pageModel.js');
var SiteModel = require('./siteModel.js');

var config = require("./config.js"); 


function init() {
	console.log("Connecting to mongo database...");

	return mongoose.connectQ(config.db.mongo.url)
		.then(function() {
			console.log("Mongo database connected.");
		});
}


function getSites() {
	return SiteModel.findAllQ();
}
function getSite(name) {
		return SiteModel.getByNameQ(name);
}
function sitePageCount(siteName){
	return SiteModel.getByNameQ(siteName)
		.then(function(site){
				return site.pagesCountQ();
		});
}


exports.init = init;
exports.getSites = getSites;
exports.getSite = getSite;
exports.sitePageCount = sitePageCount;

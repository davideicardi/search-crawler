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
	return SiteModel.appFindAll();
}
function getSite(name) {
		return SiteModel.appGet(name);
}
function sitePageCount(siteName){
	return SiteModel.appGet(siteName)
		.then(function(site){
				return site.appCountPages();
		});
}

function insertSite(site){
	return SiteModel.appInsert(site);
};

exports.removeSite = function(siteName){
	if (typeof siteName !== "string"){
    throw new Error("Invalid site, name or _id expected.");
	}
	
  return SiteModel.appGet(siteName)
		.then(function(site){
      return site.appDeletePages()
		    .then(function(){
			    return site.removeQ();
		    });
    });
};

exports.init = init;
exports.getSites = getSites;
exports.getSite = getSite;
exports.sitePageCount = sitePageCount;
exports.insertSite = insertSite;

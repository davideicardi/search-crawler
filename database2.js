var mongoose = require('./mongoose-q.js');
var Schema = mongoose.Schema;

var config = require("./config.js"); 

// Site Schema
var siteSchema = new Schema({
						name: String,
						url: String,
						status: String,
						config: { 
								contentSelector : String, 
								urlPattern : String
						}
					});
var	SiteModel = mongoose.model("Site", siteSchema, "sites");

function init() {
	console.log("Connecting to mongo database...");

	return mongoose.connectQ(config.db.mongo.url)
		.then(function() {
			console.log("Mongo database connected.");
		});
}

function getSites() {
	return SiteModel.findQ();
}
function getSite(name) {
	if (typeof name !== "string"){
			throw new Error("name expected");
	}
	
	return SiteModel.where({name : name}).findOneQ();
}

exports.init = init;
exports.getSites = getSites;
exports.getSite = getSite;

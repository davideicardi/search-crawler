var mongoose = require('./mongoose-q.js');
var Schema = mongoose.Schema;

var PageModel = require('./pageModel.js');

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
					
siteSchema.methods.appCountPages = function () {
	var siteId = this._id.toString();
	
  return PageModel
  	.where({siteId : siteId})
  	.countQ();
};
siteSchema.methods.appDeletePages = function () {
	var siteId = this._id.toString();
  return PageModel
  	.where({siteId : siteId})
  	.removeQ()
  	.spread(function (numberAffected, result){
			return numberAffected;
		});
};
siteSchema.methods.appGetPages = function () {
	var siteId = this._id.toString();
  return PageModel
  	.where({siteId : siteId})
  	.findQ();
};
siteSchema.methods.appDeletePage = function (pageUrl) {
	var siteId = this._id.toString();
  return PageModel
  	.where({siteId : siteId, url: pageUrl})
  	.removeQ()
  	.spread(function (numberAffected, result){
			return numberAffected;
		});
};
siteSchema.methods.appInsertPage = function (page) {
	page.siteId = this._id.toString();
	if (!page.keywords) {
		page.keywords = [];
	}
	page.keywords.push("*");

	var pm = new PageModel(page);
	return pm.saveQ()
		.spread(function (result, numberAffected){
			return result;
		});
};
siteSchema.methods.appDelete = function () {
	var site = this;
  return site.appDeletePages()
    .then(function(){
	    return site.removeQ();
    });
};
siteSchema.methods.appUpdate = function () {
	return this.saveQ()
			.spread(function (result, numberAffected){
				return result;
			});
};


var	SiteModel = mongoose.model("Site", siteSchema, "sites");


SiteModel.appGet = function(name){
	if (typeof name !== "string"){
			throw new Error("name expected");
	}
	
	return SiteModel
		.where({name : name})
		.findOneQ()
		.then(function(site){
				if (!site) {
						throw new Error("Site '" + name + "' not found");
				}
		
				return site;
		});
};
SiteModel.appFindAll = function(){
	return SiteModel.where().findQ();
};
SiteModel.appInsert = function(site){
	if (!site.config){
			site.config = {};
	}
	
	if (!site.status){
			site.status = 'ready';
	}
	
	if (!site.config.contentSelector){
			site.config.contentSelector = config.parser.defaultContentSelector;
	}
	if (!site.config.urlPattern){
			site.config.urlPattern = "^" + regExpEscape(site.url);
	}
	
	var sm = new SiteModel(site);
	return sm.saveQ()
		.spread(function (result, numberAffected){
			return result;
		});
};



var regExpEscape = function(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


module.exports = SiteModel;

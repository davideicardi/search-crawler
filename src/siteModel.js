"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PageModel = require("./pageModel.js");

var config = require("./config.js");

// Site Schema
var siteSchema = new Schema({
		name: { type: String, required: true, match: /^[\w_\.-]{3,20}$/ },
		url: { type: String, required: true, match: /^http.{3,}/ },
		status: { type: String, required: true, enum: ["ready", "crawling"], default: 'ready' },
		lastCrawled: { type: Date, required: false },
		config: {
				contentSelector : { type: String, required: true },
				urlPattern : { type: String, required: true },
				crawlingCron : { type: String, required: false }
		}
	});
siteSchema.index({ name: 1}, { name: 'key', unique: true });


siteSchema.methods.appCountPages = function () {
	var siteId = this._id.toString();

  return PageModel
  	.where({siteId : siteId})
  	.count();
};
siteSchema.methods.appDeletePages = function () {
	var siteId = this._id.toString();
  return PageModel
  	.where({siteId : siteId})
  	.remove()
  	.then(function ([numberAffected, result]){
			return numberAffected;
		});
};
siteSchema.methods.appGetPages = function () {
	var siteId = this._id.toString();
  return PageModel
  	.where({siteId : siteId})
  	.find();
};
siteSchema.methods.appSearchPages = function (expression, limit) {
	if (!limit || limit < 0 || limit > 100 || isNaN(limit)) {
		limit = 20;
	}

	var siteId = this._id.toString();
	var criteria = {
		siteId: siteId,
		$text: { $search: expression }
	};
	var sort = { score: { $meta: "textScore" } };
	var projection = {
		url: 1, title: 1, description: 1, keywords: 1,
		score : { $meta: "textScore" }
	};

  return PageModel
  	.where(criteria)
  	.sort(sort)
  	.limit(limit)
  	.select(projection)
  	.find();
};
siteSchema.methods.appDeletePage = function (pageUrl) {
	var siteId = this._id.toString();
  return PageModel
  	.where({siteId : siteId, url: pageUrl})
  	.remove()
  	.then(function ([numberAffected, result]){
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
	return pm.save()
		.then(function ([result, numberAffected]){
			return result;
		});
};
siteSchema.methods.appDelete = function () {
	var site = this;
  return site.appDeletePages()
    .then(function(){
	    return site.remove();
    });
};
siteSchema.methods.appUpdate = function () {
	return this.save()
			.then(function ([result, numberAffected]){
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
		.findOne()
		.then(function(site){
				if (!site) {
						throw new Error("Site '" + name + "' not found");
				}

				return site;
		});
};
SiteModel.appFindAll = function(){
	return SiteModel.where().find();
};
SiteModel.appInsert = function(site){
	if (!site.config){
			site.config = { crawlingCron: null };
	}

	if (!site.config.contentSelector){
			site.config.contentSelector = config.parser.defaultContentSelector;
	}
	if (!site.config.urlPattern && site.url){
			site.config.urlPattern = "^" + regExpEscape(site.url);
	}

	var sm = new SiteModel(site);
	return sm.save()
		.then(function ([result, numberAffected]){
			return result;
		});
};



var regExpEscape = function(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


module.exports = SiteModel;

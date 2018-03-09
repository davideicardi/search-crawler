"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageSchema = new Schema({
		siteId: { type: String, required: true },
		url: { type: String, required: true },
		title: { type: String, required: true },
		description: { type: String, required: true },
		body: { type: String, required: true },
		keywords: [String]
	});
pageSchema.index({ siteId: 1, url: 1 }, { name: 'key', unique: true });
pageSchema.index({ siteId: 1, '$**': "text" }, { name: 'searchIndex' });



var PageModel = mongoose.model("Page", pageSchema, "pages");

module.exports = PageModel;
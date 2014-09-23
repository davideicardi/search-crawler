var mongoose = require('./mongoose-q.js');
var Schema = mongoose.Schema;

var pageSchema = new Schema({
		siteId: String,
		url: String,
		title: String,
		description: String,
		body: String,
		keywords: [String]
	});

var PageModel = mongoose.model("Page", pageSchema, "pages");

module.exports = PageModel;
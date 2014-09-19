var mongoose = require('./mongoose-q.js');

var config = require("./config.js"); 

function init() {
	console.log("Connecting to mongo database...");

	return mongoose.connect(config.db.mongo.url)
		.then(function() {
			console.log("Mongo database connected.");
		});
}

exports.init = init;
"use strict";

var mongoose = require("mongoose");
var Q = require("q");

function connectQ(url) {
	var deferred = Q.defer();

	var connection = mongoose.connection;
	connection.on("error", function(err) {
		deferred.reject(err);
	});
	connection.once("open", function () {
		deferred.resolve();
	});

	mongoose.connect(url);

	return deferred.promise;
}

function denodifyMethod(funcName){
	return function(){
		return Q.npost(this, funcName, arguments);
	}
};

// Query
mongoose.Query.prototype.findQ = denodifyMethod("find");
mongoose.Query.prototype.findOneQ = denodifyMethod("findOne");
mongoose.Query.prototype.countQ = denodifyMethod("count");
mongoose.Query.prototype.removeQ = denodifyMethod("remove");

// Model
mongoose.Model.prototype.saveQ = denodifyMethod("save");
mongoose.Model.prototype.removeQ = denodifyMethod("remove");


mongoose.connectQ = connectQ;

module.exports = mongoose;

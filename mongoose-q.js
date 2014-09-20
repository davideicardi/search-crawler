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
		var f = Q.nfbind(this[funcName].bind(this));
		return f.apply(arguments);
	}
};

//mongoose.Model.findQ = denodifyMethod("find"); 
mongoose.Query.prototype.findQ = denodifyMethod("find");
mongoose.Query.prototype.findOneQ = denodifyMethod("findOne");
mongoose.Query.prototype.countQ = denodifyMethod("count");

mongoose.connectQ = connectQ;
module.exports = mongoose;


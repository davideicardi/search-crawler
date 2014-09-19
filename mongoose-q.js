var mongoose = require('mongoose');
var Q = require("q");

function connect(url) {
	var deferred = Q.defer();

	var connection = mongoose.connection;
	connection.on('error', function(err) {
		deferred.reject(err);
	});
	connection.once('open', function () {
		deferred.resolve();
	});

	mongoose.connect(url)

	return deferred.promise;
}


exports.connect = connect;
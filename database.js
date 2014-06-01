var mongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var Q = require("q");
var schema = require('validate');

var config = require("./config.js"); 
var SmartCollection = require("./SmartCollection.js"); 

var myDb = {};

var mongoConnect = function(){

    var deferred = Q.defer();
    
    mongoClient.connect(config.db.mongo.url, function(err, db) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(db);
    });

    return deferred.promise;
};

var createError = function(err){
    var deferred = Q.defer();
    
    deferred.reject(err);
    
    return deferred.promise;  
};

exports.init = function(){
    
    console.log("Connecting to mongo database...");
    
    return mongoConnect()
        .then(function(db){
            
            // sites
            myDb.sites = new SmartCollection(
                    db, 
                    "sites", 
                    schema({
                        name: { type: 'string', required: true, message: 'name is required' },
                        url: { type: 'string', required: true, match: /http.{3,}/, message: 'url must be valid' }
                      }),
                    [
                     {index: {name:1}, options: {unique:true}}
                     ]);
            // pages
            
            return [
                    myDb.sites.ensure()
                    ];
        })
        .spread(function(){
            console.log("Mongo database connected.");
            
            return true;
        });
};

// sites 
exports.createSite = function(site){
    return myDb.sites.insert(site);
};
exports.removeSite = function(site){
    if (typeof site._id == "string"){
        return myDb.sites.remove({ _id : ObjectID(site._id) });
    }else if (typeof site.name == "string"){
        return myDb.sites.remove({ name : site.name });
    } else {
        return createError("Invalid site, name or _id expected.");
    }
};
exports.getSites = function(){
    return myDb.sites.find({});
};

// pages

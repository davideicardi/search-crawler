var mongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;

var schema = require('validate');

var config = require("./config.js"); 
var Q = require("q");

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

var mongoEnsureIndex = function(collection, indexes, options){

    var deferred = Q.defer();

    collection.ensureIndex(indexes, options, function(err){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(true);
     });

    return deferred.promise;
};

var mongoInsert = function(collection, document) {
    var deferred = Q.defer();
    
    collection.insert(document, function(err, inserted){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(inserted);
    });

    return deferred.promise;
};

var mongoRemove = function(collection, query) {
    var deferred = Q.defer();
  
    collection.remove(query, {justOne:true}, function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });

    return deferred.promise;
};

var mongoFind = function(collection, query) {
    var deferred = Q.defer();
    
    collection.find(query).toArray(function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });  
    
    return deferred.promise;
};

var ensureCollections = function(){
    
    return mongoEnsureIndex(myDb.sites, {name:1}, {unique:true});
    
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
            myDb.sites = db.collection('sites');
            
            return ensureCollections(); 
        })
        .then(function(){
            console.log("Mongo database connected.");
            
            return true;
        });
};

exports.createSite = function(site){
    
    var siteSchema = schema({
        name: { type: 'string', required: true, message: 'name is required' },
        url: { type: 'string', required: true, match: /http.{3,}/, message: 'url must be valid' }
      });

    siteSchema.assert(site);
    
    return mongoInsert(myDb.sites, site);
};

exports.removeSite = function(site){
    if (typeof site._id == "string"){
        return mongoRemove(myDb.sites, { _id : ObjectID(site._id) });
    }else if (typeof site.name == "string"){
        return mongoRemove(myDb.sites, { name : site.name });
    } else {
        return createError("Invalid site, name or _id expected.");
    }
};

exports.getSites = function(completed, failed){

    return mongoFind(myDb.sites, {});
};
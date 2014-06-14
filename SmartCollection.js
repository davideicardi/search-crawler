var Q = require("q");
//var mongoClient = require("mongodb").MongoClient;
//var ObjectID = require("mongodb").ObjectID;
//var schema = require('validate');


function SmartCollection (mongoDb, collectionName, schema, indexes) {
    this._mongoDb = mongoDb;
    this._collectionName = collectionName;
    this._collection = mongoDb.collection(collectionName);
    this._schema = schema;
    this._indexes = indexes;
}

SmartCollection.prototype.ensureIndex = function(indexes, options){

    var deferred = Q.defer();

    this._collection.ensureIndex(indexes, options, function(err){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(true);
     });

    return deferred.promise;
};

SmartCollection.prototype.ensure = function(){

    var promises = [];
    var length = this._indexes.length;
    var i;
    for (i = 0; i < length; i++){
        var promise = this.ensureIndex(this._indexes[i].index, this._indexes[i].options);
        promises.push(promise);
    }
    
    return Q.all(promises)
        .spread(function(){
            return true;
        });
};

SmartCollection.prototype.insert = function(document) {
    
    if (this._schema){
        this._schema.assert(document);
    }
    
    var deferred = Q.defer();
    
    this._collection.insert(document, function(err, inserted){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(inserted[0]);
    });

    return deferred.promise;
};

SmartCollection.prototype.remove = function(query) {
    var deferred = Q.defer();
  
    this._collection.remove(query, {justOne:true}, function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });

    return deferred.promise;
};

SmartCollection.prototype.find = function(query) {
    var deferred = Q.defer();
    
    this._collection.find(query).toArray(function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });  
    
    return deferred.promise;
};

SmartCollection.prototype.count = function(query) {
    var deferred = Q.defer();
    
    this._collection.find(query).count(function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });  
    
    return deferred.promise;
};

SmartCollection.prototype.findOne = function(query, fields, options) {
    var deferred = Q.defer();
    
    this._collection.findOne(query, fields, options, function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });  
    
    return deferred.promise;
};

SmartCollection.prototype.findText = function(query, limit) {
    var deferred = Q.defer();
    
    this._collection.find(
            query,
            { score: { $meta: "textScore" } }
         ).sort( { score: { $meta: "textScore" } } )
         .limit(limit)
         .toArray(function(err, result){
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(result);
    });  
    
    return deferred.promise;
};

module.exports = SmartCollection;
var mongoClient = require('mongodb').MongoClient;
var config = require("./config.js"); 

var siteCollection;

var errorHandler = function(err, failed) {
    if (err) {
        failed(err);
        return true;
    }
    
    return false;
};

exports.init = function(completed, failed){
    
    console.log("Connecting to mongo database...");
    
    mongoClient.connect(config.db.mongo.url, function(err, db) {
        if (errorHandler(err, failed)) return;

        siteCollection = db.collection('sites');
        
        console.log("Mongo database connected.");

        siteCollection.ensureIndex({name:1}, {unique:true}, function(){
            completed();
        });
        
      });
};

exports.createSite = function(site, completed, failed){
    
    if (/\w{3,}/.test(site.name) == false){
        failed(new Error("Invalid site.name"));
        return;
    }
    if (/http.{3,}/.test(site.url) == false){
        failed(new Error("Invalid site.name"));
        return;
    }
    
    siteCollection.insert(site, function(err, inserted){
        if (errorHandler(err, failed)) return;
        
        completed(inserted);
    });
};

exports.getSites = function(completed, failed){

    siteCollection.find().toArray(function(err, result){
        if (errorHandler(err, failed)) return;
        
        completed(result);
    });
};
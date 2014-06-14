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
                        name: { type: 'string', required: true, match: /^\w{3,20}$/, message: 'name is required' },
                        url: { type: 'string', required: true, match: /^http.{3,}/, message: 'url must be valid' }
                      }),
                    [
                     {index: {name:1}, options: {unique:true}}
                     ]);
            // pages
            myDb.pages = new SmartCollection(
                    db, 
                    "pages", 
                    schema({
                        siteId: { type: 'string', required: true, message: 'siteId is required'},
                        url: { type: 'string', required: true, message: 'url is required' },
                        title: { type: 'string', required: true, message: 'title is required' },
                        description: { type: 'string', required: true, message: 'description is required' },
                        body: { type: 'string', required: true, message: 'body is required' }
                      }),
                    [
                     {index: {siteId:1, url:1}, options: {unique:true}},
                     {index: {siteId:1, body:"text"}, options: {}}
                     ]);
            
            return [
                    myDb.sites.ensure(),
                    myDb.pages.ensure()
                    ];
        })
        .spread(function(){
            console.log("Mongo database connected.");
            
            return true;
        });
};

// sites 
exports.insertSite = function(site){
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
exports.getSite = function(name){
    if (typeof name != "string"){
        return createError("name expected");
    }
    
    return myDb.sites.findOne({name : name});
};

// pages
exports.insertPage = function(page, siteName){
    if (page.siteId) {
        return myDb.pages.insert(page);
    }
    
    return exports.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Site " + siteName + " not found");
        }
        
        page.siteId = site._id.toString();
        
        return myDb.pages.insert(page);
    });
};
exports.sitePageCount = function(siteName){
    return exports.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Site " + siteName + " not found");
        }
        
        var siteId = site._id.toString();
        
        return myDb.pages.count({siteId:siteId});
    });
};
exports.removePage = function(page, siteName){
    if (typeof page._id == "string"){
        return myDb.pages.remove({ _id : ObjectID(page._id) });
    }
    else if (typeof page.url != "string") {
        return createError("page.url or page._id required");
    }
    else if (typeof page.siteId == "string") {
        return myDb.pages.remove({ url : page.url, siteId : page.siteId });
    }
    
    return exports.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Site " + siteName + " not found");
        }
        
        page.siteId = site._id.toString();
        
        return myDb.pages.remove({ url : page.url, siteId : page.siteId });
    });
};
exports.removePages = function(siteName){
    return exports.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Site " + siteName + " not found");
        }
        
        return myDb.pages.remove({ siteId : site._id.toString() });
    });    
};
exports.searchPages = function(expression, siteName, limit){
    
    if (limit < 0 || limit > 100){
        limit = 20;
    }
    
    return exports.getSite(siteName)
    .then(function(site){
        if (!site) {
            throw new Error("Site " + siteName + " not found");
        }
        
        var siteId = site._id.toString();
        return myDb.pages.findText(
                { siteId : siteId, $text: { $search: expression } },
                limit);
    }); 
};
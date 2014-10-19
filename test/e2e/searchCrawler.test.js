"use strict";

// run tests using
// npm run test-e2e

// configure chai assertions
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

var Q = require("q");

var searchCrawler = require("./../../src/searchCrawler.js");

function randomName()
{
  var dt = new Date().valueOf();
  
  return "test" + dt.toString();
}

describe("searchCrawler", function() {

  var testSiteName = randomName();
  var testSiteUrl = "http://www.google.com/";

  function containsTestSite(sites){
    var filtered = sites.filter(function(s){
     return s.name == testSiteName && s.url == testSiteUrl;
      });

    return filtered.length == 1;
  }

  function notContainsTestSite(sites){
    var filtered = sites.filter(function(s){
     return s.name == testSiteName;
      });

    return filtered.length == 0;
  }

  before(function(){
    return searchCrawler.init();
  });

  var previousSites;

  beforeEach(function(){
    var listPromise = searchCrawler.getSites();

    listPromise.then(function(result){
      previousSites = result;
    });

    return listPromise;
  });

  describe("insertSite", function() {

    it("Should inserted a site", function() {

      var result = searchCrawler.insertSite({name:testSiteName, url:testSiteUrl});

      return Q.all([
         expect(result).to.eventually.have.property("_id"),
         expect(result).to.eventually.have.property("name", testSiteName),
         expect(result).to.eventually.have.property("url", testSiteUrl),
        ]);
    });

    it("getSites should returns the created site", function() {

      var result = searchCrawler.insertSite({name:testSiteName, url:testSiteUrl});

      var sites = result.then(function(){
        return searchCrawler.getSites();
      });

      return Q.all([
         expect(sites).to.eventually.have.property("length", previousSites.length+1),
         expect(sites).to.eventually.satisfy(containsTestSite)
        ]);
    });

    it("getSite should return the created site", function() {

      var result = searchCrawler.insertSite({name:testSiteName, url:testSiteUrl});

      var site = result.then(function(){
        return searchCrawler.getSite(testSiteName);
      });

      return Q.all([
         expect(site).to.eventually.have.property("_id"),
         expect(site).to.eventually.have.property("name", testSiteName),
         expect(site).to.eventually.have.property("url", testSiteUrl),
        ]);
    });

    it("Unknown fields will be ignored", function() {

      var result = searchCrawler.insertSite({
        name:testSiteName, 
        url:testSiteUrl, 
        invalidField:"test"
      });

      var site = result.then(function(){
        return searchCrawler.getSite(testSiteName);
      });

      return Q.all([
         expect(site).to.eventually.not.have.property("invalidField"),
        ]);
    });

    afterEach(function(){
      return searchCrawler.removeSite(testSiteName);
    });

  });

  describe("insertSite Errors", function() {


    it("Name is required", function() {

      var result = searchCrawler.insertSite({
        url:testSiteUrl, 
      });

      return Q.all([
         expect(result).to.eventually.be.rejected,
        ]);
    });

    it("Url is required", function() {

      var result = searchCrawler.insertSite({
        name:testSiteName, 
      });

      return Q.all([
         expect(result).to.eventually.be.rejected,
        ]);
    });    

  });

  describe("removeSite", function() {

    beforeEach(function(){
      return searchCrawler.insertSite({name:testSiteName, url:testSiteUrl});
    });

    it("Should remove the specified site", function() {

      var result = searchCrawler.removeSite(testSiteName);

      return Q.all([
         expect(result).to.eventually.have.property("_id"),
         expect(result).to.eventually.have.property("name", testSiteName),
        ]);
    });

    it("getSites shouldn't return the site", function() {

      var result = searchCrawler.removeSite(testSiteName);

      var sites = result.then(function(){
        return searchCrawler.getSites();
      });

      return Q.all([
         expect(sites).to.eventually.have.property("length", previousSites.length),
         expect(sites).to.eventually.satisfy(notContainsTestSite)
        ]);
    });

    it("getSite should fail", function() {

      var result = searchCrawler.removeSite(testSiteName);

      var site = result.then(function(){
        return searchCrawler.getSite(testSiteName);
      });

      return Q.all([
         expect(site).to.eventually.be.rejected,
        ]);
    });

  });

  describe("registerPage", function() {

    beforeEach(function(){
      return searchCrawler.insertSite({name:testSiteName, url:testSiteUrl});
    });

    it("Should register a specific page", function() {

      var result = searchCrawler.registerPage(testSiteName, "http://nodejs.org/");

      return Q.all([
         expect(result).to.eventually.have.property("_id"),
         expect(result).to.eventually.have.property("url", "http://nodejs.org/"),
         expect(result).to.eventually.have.property("title", "node.js"),
        ]);
    });

    it("sitePageCount should be incremented", function() {

      var result = searchCrawler.registerPage(testSiteName, "http://nodejs.org/");

      var pageCount = result.then(function(){
        return searchCrawler.sitePageCount(testSiteName);
      });

      return Q.all([
         expect(pageCount).to.eventually.equal(1)
        ]);
    });

    afterEach(function(){
      return searchCrawler.removeSite(testSiteName);
    });

  });

  describe("searchPages", function() {

    beforeEach(function(){
      return searchCrawler.insertSite({name:testSiteName, url:testSiteUrl})
      .then(function(){
        return searchCrawler.registerPage(testSiteName, "http://nodejs.org/");
      });
    });

    it("Should search a page", function() {

      var result = searchCrawler.searchPages(testSiteName, "node", 1);

      var item = result.then(function(r){
        return r[0];
      });

      return Q.all([
         expect(item).to.eventually.have.property("url", "http://nodejs.org/"),
         expect(item).to.eventually.have.property("title", "node.js"),
        ]);
    });

    it("Search an invalid expression should return an empty list", function() {

      var result = searchCrawler.searchPages(testSiteName, "invalidExpression", 1);

      return Q.all([
         expect(result).to.eventually.have.property("length", 0),
        ]);
    });

    afterEach(function(){
      return searchCrawler.removeSite(testSiteName);
    });

  });


});

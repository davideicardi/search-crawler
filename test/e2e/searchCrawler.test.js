// Install mocha
// npm install -g mocha

// run tests using
// mocha ./test/e2e/

// configure chai assertions
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

var Q = require("q");

/*
// configure REST client
var rest = require('rest');
var mime = require('rest/interceptor/mime');
var errorCode = require('rest/interceptor/errorCode');
var client = rest.wrap(mime)
             .wrap(errorCode);

function apiGet(path){

  var request = { 
    path: path 
  };

  return api(request);
}

function apiPost(path, entity){

  var request = { 
    path: path,
    entity: entity,
    headers: {"Content-Type":"application/json"}
  };
  
  return api(request);
}

function apiDelete(path){

  var request = { 
    path: path,
    method: "DELETE"
  };
  
  return api(request);
}

function api(request){
  request.path = 'https://search-crawler-c9-davideicardi.c9.io/api' + request.path;
  
  return client(request)
    .then(function(response){
      //console.log(response);
      return response.entity;
    });

}
*/

var searchCrawler = require("./../../src/searchCrawler.js");

function randomName()
{
  var dt = new Date().valueOf();
  
  return "test" + dt.toString();
}

describe("searchCrawler", function() {

  var siteName = randomName();

  beforeEach(function(){
    return searchCrawler.init();
  });

  it("Should create a site", function() {

    var result = searchCrawler.insertSite({name:siteName, url:"http://www.google.com/"});

    return Q.all([
       expect(result).to.eventually.have.property("_id"),
       expect(result).to.eventually.have.property("name", siteName)
      ]);
  });

});

'use strict';

/* App Module */

var searchCrawlerApp = angular.module('searchCrawlerApp', [
  'ngRoute',
  'ngResource'
]);

searchCrawlerApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/sites', {
        templateUrl: 'partials/site-list.html',
        controller: 'SiteListController'
      }).
      when('/sites/create', {
          templateUrl: 'partials/site-create.html',
          controller: 'SiteCreateController'
        }).
      when('/sites/detail/:siteName', {
        templateUrl: 'partials/site-detail.html',
        controller: 'SiteDetailController'
      }).
      otherwise({
        redirectTo: '/sites'
      });
  }]);


/////////////////////////////////
// Controllers
/////////////////////////////////

searchCrawlerApp.controller('SiteListController', ['$scope', 'SiteApi',
 function($scope, SiteApi) {
    
   $scope.sites = SiteApi.query();
   
 }]);

searchCrawlerApp.controller('SiteDetailController', ['$scope', '$routeParams', '$location', 'SiteApi',
   function($scope, $routeParams, $location, SiteApi) {
     $scope.site = SiteApi.get({siteName:$routeParams.siteName});
     
     $scope.remove = function(){
       SiteApi.remove({siteName: $scope.site.name}, function() {
           $location.path("/sites");
       });
     };
   }]);

searchCrawlerApp.controller('SiteCreateController', ['$scope', '$location', 'SiteApi',
   function($scope, $location, SiteApi) {
      
    $scope.site = {};
     
     $scope.createSite = function(){
         var newSite = new SiteApi();
         newSite.name = $scope.site.name;
         newSite.url = $scope.site.url;
         
         newSite.$save({}, function() {
             $location.path("/sites");
         });
     };
   }]);

/////////////////////////////////
// Services
/////////////////////////////////

searchCrawlerApp.factory('SiteApi', ['$resource',
   function($resource){
     return $resource('/api/sites/:siteName');
   }]);



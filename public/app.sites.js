'use strict';

var myAppSites = angular.module('myApp.sites', []);


/////////////////////////////////
// Controllers
/////////////////////////////////

myAppSites.controller('SiteListController', ['$scope', 'SiteApi',
 function($scope, SiteApi) {
    
   $scope.sites = SiteApi.query();
   
 }]);

myAppSites.controller('SiteDetailController', ['$scope', '$stateParams', '$state', 'SiteApi',
   function($scope, $stateParams, $state, SiteApi) {
    
     $scope.site = SiteApi.get({siteName:$stateParams.siteName});
     
     var refreshCount = function(){
         $scope.pageCount = SiteApi.getPageCount({siteName:$stateParams.siteName});
     };

     refreshCount();
     
     $scope.remove = function(){
         
       SiteApi.remove({siteName: $scope.site.name}, function() {
                   
           $state.go("admin.sites.list");
       });
     };
     
     $scope.removeAllPages = function() {
         SiteApi.removePages({siteName:$scope.site.name}, {},
                 refreshCount);
     };
     
     $scope.crawl = function() {
         SiteApi.crawl({siteName:$scope.site.name}, {},
                 function() {$scope.$emit('notification', 'success', "Crawl in progress...");});
     };
     
     $scope.registerPage = function(pageUrl){
         
         SiteApi.registerPage({siteName:$scope.site.name}, {url:pageUrl},
                 refreshCount);
         
         $scope.pageToRegister = null;
     };
     
     $scope.search = function(query) {
         $scope.searchResult = SiteApi.search({siteName:$scope.site.name, q: query});
     };
     
     $scope.refreshCount = refreshCount;
   }]);

myAppSites.controller('SiteCreateController', ['$scope', '$state', 'SiteApi',
   function($scope, $state, SiteApi) {
      
    $scope.site = {};
     
     $scope.createSite = function(){
         var newSite = new SiteApi();
         newSite.name = $scope.site.name;
         newSite.url = $scope.site.url;
         
         newSite.$save({}, function() {
             $state.go("admin.sites.detail", {siteName:newSite.name});
         });
     };
   }]);

/////////////////////////////////
// Services
/////////////////////////////////

myAppSites.factory('SiteApi', ['$resource',
   function($resource){
     return $resource(
             '/api/sites/:siteName', 
             { },
             {
                 registerPage: { method:'POST', url:'/api/sites/:siteName/register-page' },
                 removePages: { method:'POST', url:'/api/sites/:siteName/remove-pages' },
                 crawl: { method:'POST', url:'/api/sites/:siteName/crawl' },
                 search: { method:'GET', url:'/api/sites/:siteName/search', isArray:true },
                 getPageCount: { method:'GET', url:'/api/sites/:siteName/page-count' }
             });
   }]);


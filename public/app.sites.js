'use strict';

var myAppSites = angular.module('myApp.sites', []);


/////////////////////////////////
// Controllers
/////////////////////////////////

myAppSites.controller('SitesController', ['$scope', 'SiteApi',
 function($scope, SiteApi) {
    
   $scope.sites = SiteApi.query();
   
   $scope.removeSiteFromList = function(siteName){
       var i = $scope.sites.length;
       while (i--) {
           if ($scope.sites[i].name == siteName) {
               $scope.sites.splice(i, 1);
               return;
           }
       }  
   };
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
           
           $scope.removeSiteFromList($scope.site.name);
                   
           $state.go("admin.sites");
       });
     };
     
     $scope.removeAllPages = function() {
         SiteApi.removePages({siteName:$scope.site.name}, {},
                 refreshCount);
     };
     
     $scope.registerPage = function(pageUrl){
         
         SiteApi.registerPage({siteName:$scope.site.name}, {url:pageUrl},
                 refreshCount);
         
         $scope.pageToRegister = null;
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
             $scope.sites.push(newSite);
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
                 getPageCount: { method:'GET', url:'/api/sites/:siteName/page-count' }
             });
   }]);


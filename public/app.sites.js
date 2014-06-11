'use strict';

var myAppSites = angular.module('myApp.sites', []);


/////////////////////////////////
// Controllers
/////////////////////////////////

myAppSites.controller('SitesController', ['$scope', 'SiteApi',
 function($scope, SiteApi) {
    
   $scope.sites = SiteApi.query();
   
   $scope.removeSite = function(siteName){
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
     
     $scope.remove = function(){
         
       SiteApi.remove({siteName: $scope.site.name}, function() {
           
           $scope.removeSite($scope.site.name);
                   
           $state.go("admin.sites");
       });
     };
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
             $state.go("admin.sites");
         });
     };
   }]);

/////////////////////////////////
// Services
/////////////////////////////////

myAppSites.factory('SiteApi', ['$resource',
   function($resource){
     return $resource('/api/sites/:siteName');
   }]);


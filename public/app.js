'use strict';

/* App Module */

var myApp = angular.module('myApp', [
  'ui.router',
  'ngResource',
  'myApp.sites'
]);

myApp.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/home");

    $stateProvider
      .state('home', {
        url: "/home",
        templateUrl: "partials/home.html"
      })
      .state('admin', {
        url: "/admin",
        abstract: true,
        templateUrl: "partials/admin.html"
      })
      .state('admin.sites', {
          url: "/sites",
          templateUrl: "partials/sites.html",
          controller: 'SitesController'
        })
      .state('admin.sites.create', {
          url: "/create",
          templateUrl: "partials/sites.create.html",
          controller: 'SiteCreateController'
        })
      .state('admin.sites.detail', {
        url: "/detail/:siteName",
          templateUrl: "partials/sites.detail.html",
          controller: 'SiteDetailController'
        })
        ;
    
  }]);    

myApp.factory('httpErrorInterceptor', ['$q', '$rootScope',
   function($q, $rootScope) {

    var myInterceptor = {
        responseError: function(rejection) {
            console.log('error on http inteceptor');
            
            var msg = 'Error ' + rejection.status + ': ';
            if (rejection.data != null) {
                msg += rejection.data.err;   
            }
            $rootScope.$emit('errorNotification', msg);
            
            return $q.reject(rejection);
          }
    };

    return myInterceptor;
}]);

myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpErrorInterceptor');
}]);

// re-initialize Foundation when a new view is loaded 
myApp.run(function($rootScope) {
        $rootScope.$on('$viewContentLoaded', function () {
            $(document).foundation();
        });
    });


myApp.controller('notificationController', ['$scope', '$rootScope',
   function($scope, $rootScope) {
    
    $scope.notifications = [];
     
    var notify = function(type, message){
        $scope.notifications.push({type: type, message: message});
    };
    
    $scope.close = function(index){
      $scope.notifications.splice(index, 1);  
    };
    
    $rootScope.$on('errorNotification', function(event, message){
        notify('error', message);
    });
   }]);

// http://zachsnow.com/#!/blog/2013/confirming-ng-click/
myApp.directive('ngConfirmClick', [
    function(){
      return {
        priority: -1,
        restrict: 'A',
        link: function(scope, element, attrs){
          element.bind('click', function(e){
            var message = attrs.ngConfirmClick;
            if(message && !confirm(message)){
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          });
        }
      };
    }
  ]);

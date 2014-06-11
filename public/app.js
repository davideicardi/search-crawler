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




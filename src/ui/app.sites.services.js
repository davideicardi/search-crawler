'use strict';

var myAppSites = angular.module('myApp.sites.services', []);

myAppSites.factory('SiteApi', ['$resource',
	function($resource){
		return $resource(
			 '/api/sites/:siteName',
			 { },
			 {
				 registerPage: { method:'POST', url:'/api/sites/:siteName/register-page' },
				 removePages: { method:'POST', url:'/api/sites/:siteName/remove-pages' },
				 updateConfig: { method:'POST', url:'/api/sites/:siteName/update-config' },
				 crawl: { method:'POST', url:'/api/sites/:siteName/crawl' },
				 search: { method:'GET', url:'/api/sites/:siteName/search', isArray:true },
				 getPageCount: { method:'GET', url:'/api/sites/:siteName/page-count' },
				 getPages: { method:'GET', url:'/api/sites/:siteName/pages' }
		 });
	}]);


myAppSites.factory('JobApi', ['$resource',
	function($resource){
		return $resource(
			'/api/jobs',
			{
			 },
			{
				load: { method:'POST', url:'/api/jobs/load', isArray:true },
				unload: { method:'POST', url:'/api/jobs/unload', isArray:true },
			});
		}]);

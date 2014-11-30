'use strict';

var myAppSites = angular.module('myApp.sites', ['myApp.sites.services']);


/////////////////////////////////
// Controllers
/////////////////////////////////

myAppSites.controller('SiteListController', ['$scope', 'SiteApi', 'JobApi',
 function($scope, SiteApi, JobApi) {

	 $scope.sites = SiteApi.query();

   $scope.jobs = JobApi.query();

   $scope.loadJobs = function(){
     $scope.jobs = JobApi.load();
   };
   $scope.unloadJobs = function(){
     $scope.jobs = JobApi.unload();
   };

 }]);

myAppSites.controller('SiteDetailController', ['$scope', '$stateParams', '$state', '$timeout', 'SiteApi',
	 function($scope, $stateParams, $state, $timeout, SiteApi) {

		 var autoRefresh = function() {
		 	if ($scope.site.status == "crawling") {
			 	$timeout(loadSite, 1000);
			 }
		 };

		 var loadSite = function(){
			SiteApi.get({siteName:$stateParams.siteName}, {}, function(site){
				$scope.site = site;
				autoRefresh();
			});
			SiteApi.getPageCount({siteName:$stateParams.siteName}, {}, function(pageCount){
				$scope.pageCount = pageCount;
			});
		 };

		 var crawlStarted = function() {
		 	$scope.$emit('notification', 'success', "Crawl in progress...");
		 	$scope.site.status = "crawling";

		 	autoRefresh();
		 };

		 loadSite();

		 $scope.remove = function(){

			 SiteApi.remove({siteName: $scope.site.name}, function() {

					 $state.go("admin.sites.list");
			 });
		 };

		 $scope.removeAllPages = function() {
			 SiteApi.removePages({siteName:$scope.site.name}, {},
							 loadSite);
		 };

		 $scope.crawl = function() {
			SiteApi.crawl({siteName:$scope.site.name}, {}, crawlStarted);
		 };

		 $scope.registerPage = function(pageUrl){
			SiteApi.registerPage({siteName:$scope.site.name}, {url:pageUrl},
							loadSite);

			$scope.pageToRegister = null;
		 };

		 $scope.search = function(query) {
			$scope.searchResult = SiteApi.search({siteName:$scope.site.name, q: query});
		 };

		 $scope.editConfig = function() {
			$scope.editableConfig = angular.copy($scope.site.config);
		 };

		 $scope.updateConfig = function() {
			var config = $scope.editableConfig;
			SiteApi.updateConfig({siteName:$scope.site.name}, config,
							loadSite);
		 };

		 $scope.isEmptyResult = function () {
			if ($scope.searchResult) {
				return $scope.searchResult.length === 0;
			} else {
				return false;
			}
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
						 $state.go("admin.sites.detail", {siteName:newSite.name});
				 });
		 };
	 }]);

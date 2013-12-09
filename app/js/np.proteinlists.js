'use strict'

var ProteinListModule = angular.module('np.proteinlists', [
	'np.proteinlist.service', 
    'np.proteinlist.ui', 
    'np.proteinlist.upload', 
    'np.proteinlist.upload.ui',
    'np.flash'
]);


ProteinListModule.config([
	'$routeProvider',
    '$locationProvider',
    '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {
    	$routeProvider
        	.when('/proteinlists', { templateUrl: 'partials/proteinlists/list.html'})
            // .when('/proteinlists/view/:name', { templateUrl: 'partials/proteinlists/view.html'})
            .when('/proteinlists/view/:list', { templateUrl: 'partials/search/result.html'})
            .when('/proteinlists/create', { templateUrl: 'partials/proteinlists/create.html'})
    }
]);


ProteinListModule.controller('ListCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$location',
	'$routeParams',
	'$route',
	'Search',
	'ProteinListService',
	'Tools',
	function($resource, $scope, $rootScope, $location, $routeParams, $route, Search, ProteinListService, Tools) {
		$scope.Tools = Tools;
		$scope.ProteinListService = ProteinListService; 
		$scope.showCombine = false;
		$scope.combineDisabled = true;
		$scope.selected = {};
		$scope.modal = { options: { edit: { title: 'Edit' }, create: { title: 'Create'} } };
		$scope.operators = ["AND", "OR", "NOT IN"];
		$scope.combination = { first: null, op: $scope.operators[0], second: null};
		$scope.options = { first: $scope.lists, second: $scope.lists }
		
		
		ProteinListService.getByUsername('mario', function(data) {
			console.log('data: ', data['lists']);
			$scope.lists = data.lists;
			//$scope.lists = data['proteinLists'];
			$scope.initCombination();
		});
		
		
		$scope.initCombination = function() {
			$scope.$watch('combination.first', function(newVal, oldVal) {
				$scope.options.second = $scope.lists.slice(0);
				
				var index = $scope.options.second.indexOf(newVal);
				if(index > -1)
					$scope.options.second.splice(index, 1);
			});
			
			
			$scope.$watch('combination.second', function(newVal, oldVal) {
				$scope.options.first = $scope.lists.slice(0);
				
				var index = $scope.options.first.indexOf(newVal);
				
				if(index > -1)
					$scope.options.first.splice(index, 1);
			});
		};
		
		$scope.switchCombine = function() {
			var temp = $scope.combination.first;
			$scope.combination.first = $scope.combination.second;
			$scope.combination.second = temp;
		};	
		
		$scope.launchModal = function(elem, action) {
			$scope.selected = {};
			if(action == 'edit') {
				$scope.selected = $scope.lists[elem];
				angular.extend($scope.selected, {index:elem});
			} 
			angular.extend($scope.modal, { type: action});
		};

		$scope.saveModal = function(dismiss) {
			if($scope.modal.type == 'edit') {
				angular.extend($scope.lists[$scope.selected.index], $scope.selected);

				ProteinListService.updateList('mario', _.omit($scope.selected, 'index'));
				console.log('edit: ', $scope.selected);
				
			} else if($scope.modal.type == 'create') {
				var newList = { name: $scope.selected.name, description: $scope.selected.description, accessions: $scope.selected.accessions};
				
				if($scope.combination.op == 'OR') {
					newList.accessions = _.union($scope.combination.first.accessions, $scope.combination.second.accessions);
				}
				else if($scope.combination.op == 'AND') {
					newList.accessions = _.intersection($scope.combination.first.accessions, $scope.combination.second.accessions);
				}
					
//				angular.extend(attrs, { username: 'mario', });
				var attrs = { username: 'mario', list: newList};
				
				ProteinListService.createList('mario', newList, function(data) {
					console.log('created: ', data);
					$scope.lists.push(newList);
				});
			}
		};

		$scope.delete = function(index) {
			ProteinListService.deleteList('mario', $scope.lists[index].id);
			$scope.lists.splice(index, 1);

			$scope.options = $scope.lists;
			$scope.options = $scope.lists;
		}

		$scope.buildQuery = buildQuery;
	}
]);	
	
ProteinListModule.controller('ListViewCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$location',
	'$routeParams',
	'$route',
	'ProteinListService',
	'Search',
	'Tools',
	function($resource, $scope, $rootScope, $location, $routeParams, $route, ProteinListService, Search, Tools) {
		var listName = $routeParams.name;


		var list = ProteinListService.getSelectedList();





		// // coming directly through the URL
		// if(!list) {
		// 	// no lists in the Service
		// 	if(!ProteinListService.lists) {
		// 		ProteinListService.getByUsername('mario', function(data) {
		// 			list = _.find(data.proteinLists, function(l) { return listName == Tools.convertToSlug(l.name) });


		// 			Search.docs({ entity: 'proteins', configuration: 'id', query: buildQuery(list.accessions)}, function(docs) { 
		// 				console.log('found: ', docs)
		// 			});
		// 		});
		// 	}
		// } else Search.docs({ entity: 'proteins', configuration: 'id', query: buildQuery(list.accessions)}, function(data) {
		// 	console.log('search: ', data);
		// });

	}
]);

function buildQuery(accessions) {
	return "id:" + (accessions.length > 1 ? "(" + accessions.join(" ") + ")" : accessions[0]);
}

ProteinListModule.controller('ListCreateCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$routeParams',
	'ProteinListService',
	'UploadListService',
	'flash',	
	function($resource, $scope, $rootScope, $routeParams, ProteinListService, UploadListService, flash) {
		
		$scope.inputAccessions = "";
		$scope.listName = "";
		$scope.files = [];
		var selectedFiles = [];
		
		$scope.$watch('files', function (newValue, oldValue) {
	        // Only act when our property has changed.
	        if (newValue != oldValue) {
	        	selectedFiles = $scope.files;
	        	
	        	
	            //console.log('Controller: $scope.files changed. Start upload.');
	            //for (var i = 0, length = $scope.files.length; i < length; i++) {
	                // Hand file off to uploadService.
	              //  UploadListService.send($scope.files[i]);
	            //}
	        }
	    }, true);
		
		$rootScope.$on('upload:loadstart', function () {
	        console.log('Controller: on `loadstart`');
	    });

	    $rootScope.$on('upload:error', function () {
	        console.log('Controller: on `error`');
	    });
	    
	    $scope.createList = function(listName) {
	    	
	    	if($scope.inputAccessions.length > 0) {

	    		var accessions = $scope.inputAccessions.split("\n");
	    		var list = { name: $scope.listName, accessions: accessions};
	    		
	    		//ProteinListService.createList({ username: 'mario', name: listName, accessions: accessions }, function(data) {console.log('list created!')} );	
	    		ProteinListService.createList('mario', list, function(data) { 
	    			flash("alert-info", "List "+$scope.listName+" created");
	    		});
	    	} else {

	    		ProteinListService.createList('mario', { name: $scope.listName, description: $scope.listDescription, accessions: []}, function(data) {
	    			console.log('created list: ', data)
	    			for(var i=0; i<selectedFiles.length; i++)
	    			UploadListService.send(data.proteinList.id, selectedFiles[i], function(cb) {
	    				flash("alert-info", "List "+$scope.listName+" created");
	    			});
	    		});

	    		

	    		
	    	}
	    }
	 
	}
	
	
]);                                              

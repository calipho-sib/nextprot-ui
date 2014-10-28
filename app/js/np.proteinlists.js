'use strict'

var ProteinListModule = angular.module('np.proteinlists', [
	'np.proteinlist.service',
    'np.proteinlist.ui',
    'np.proteinlist.upload',
    'np.proteinlist.upload.ui',
    'np.proteinlist.service',
    'np.flash'
]);


ProteinListModule.config([
	'$routeProvider',
    '$locationProvider',
    '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {
    	$routeProvider
        	.when('/proteins/lists', { templateUrl: 'partials/proteinlists/list.html'})
            .when('/proteins/lists/create', { templateUrl: 'partials/proteinlists/create.html'})
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
	'ProteinList',
    'User',
	function($resource, $scope, $rootScope, $location, $routeParams, $route, Search, ProteinList, User) {
		$scope.ProteinList = ProteinList;
		$scope.showCombine = false;
		$scope.combineDisabled = true;
		$scope.selected = {};
		$scope.modal = { options: { edit: { title: 'Edit' }, create: { title: 'Create'} }, type:'create' };
		$scope.lists=[]
		$scope.operators = ["AND", "OR", "NOT_IN"];
		$scope.combination = { first: null, op: $scope.operators[0], second: null};
		$scope.options = { 
			first: $scope.lists, 
			second: $scope.lists 
		}

		ProteinList.getByUsername(User, function(data) {
			$scope.lists = data.lists;
			$scope.initCombination();
		});



		//
		// TODO what it mean?
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


		$scope.modalDissmiss=function(){

		}

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

				var list = {
					id: $scope.selected.id,
					name: $scope.selected.name,
					description: $scope.selected.description
				};

				ProteinList.update(User, list);
			} else if($scope.modal.type == 'create') {
				var newList = { name: $scope.selected.name, description: $scope.selected.description };

				ProteinList.combine(
                    User,
					newList,
					$scope.combination.first.name,
					$scope.combination.second.name,
					$scope.combination.op,
					function(elem) {
						//
						// TODO why this is not always an array?
						elem.accessions=elem.accessions.length
						$scope.lists.push(elem)
						$scope.options.first=$scope.options.second=$scope.lists
						console.log($scope.lists, $scope.options.first)
					});

			}
			
		};

		$scope.delete = function(index) {
			ProteinList.delete(User, $scope.lists[index].id);
			$scope.lists.splice(index, 1);

			$scope.options.first=$scope.options.second=$scope.lists
		}

		// TODO deprecated
		$scope.buildQuery = buildQuery;
	}
]);


// TODO deprecated
function buildQuery(accessions) {
	return "id:" + (accessions.length > 1 ? "(" + accessions.join(" ") + ")" : accessions[0]);
}

ProteinListModule.controller('ListCreateCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$routeParams',
	'$location',
	'ProteinList',
    'User',
	'UploadListService',
	'flash',
	function($resource, $scope, $rootScope, $routeParams, $location, ProteinList, User, UploadListService, flash) {

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

	    		ProteinList.create(User, list, function(data) {
					if(data.error) flash('alert-warning', data.error);
					else {
						flash('alert-info', "List "+list.name+" created.");
						$location.path('/proteins/lists');
					}
	    		});
	    	} else {
	    		ProteinList.create(User, {
                    name: $scope.listName, description: $scope.listDescription, accessions: []
                }, function(newList) {

	    			for(var i=0; i<selectedFiles.length; i++)
	    			UploadListService.send(newList.id, selectedFiles[i], function(data) {
						if(data.error) flash('alert-warning', data.error);
						else {
							flash('alert-info', "List "+$scope.listName+" created.");
							$location.path('/proteins/lists');
						}
	    			});
	    		});

	    	}
	    }

	}


]);


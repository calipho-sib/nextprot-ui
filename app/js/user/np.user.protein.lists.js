(function (angular, undefined) {
    'use strict';

    angular.module('np.user.protein.lists', [
        'np.user.protein.lists.service',
        'np.user.protein.lists.ui',
        'np.flash',
        'np.tracker'
    ])

//
// configure this module
        .config([
            '$routeProvider',
            '$locationProvider',
            '$httpProvider',
            function ($routeProvider) {
                $routeProvider.when('/user/protein/lists', {templateUrl: 'partials/user/user-protein-lists.html'})
                    .when('/user/protein/lists/create', {templateUrl: 'partials/user/user-protein-lists-create.html'})
            }
        ])
        .controller('ListCtrl', ListCtrl)
        .controller('ListCreateCtrl', ListCreateCtrl);

//
// Controller
    ListCtrl.$inject = ['Tracker', '$scope', 'userProteinList', 'user', 'flash', 'config'];
    function ListCtrl(Tracker, $scope, userProteinList, user, flash, config) {
        $scope.userProteinList = userProteinList;
        $scope.showCombine = false;
        $scope.combineDisabled = true;
        $scope.selected = {};
        $scope.modal = {options: {edit: {title: 'Edit'}, create: {title: 'Create'}}, type: 'create'};
        $scope.lists = [];
        $scope.operators = ["AND", "OR", "NOT_IN"];
        $scope.combination = {first: null, op: $scope.operators[0], second: null};
        $scope.options = {
            first: $scope.lists,
            second: $scope.lists
        }


        $scope.loadMyLists = function () {
            // why get a promise wrapped around the user object ?
            // why not create a promise just here ???
            user.$promise.then(function () {
                userProteinList.list(user).$promise.then(function (data) {
                    $scope.lists = data;
                    $scope.initCombinationForm();
                }, function (reason) {
                    alert('Failed: ' + reason);
                });
            })
        };

        $scope.getListExportUrl = function (list) {
            return config.api.API_URL + "/export/lists/" + list.publicId;
        };

        $scope.gaTrackDownloadList = function () {
            Tracker.trackDownloadEvent('list');
        };

        $scope.initCombinationForm = function () {

            $scope.$watch('combination.first', function (newVal, oldVal) {
                $scope.options.second = $scope.lists.slice(0);

                var index = $scope.options.second.indexOf(newVal);
                if (index > -1)
                    $scope.options.second.splice(index, 1);
            });

            $scope.$watch('combination.second', function (newVal, oldVal) {
                $scope.options.first = $scope.lists.slice(0);

                var index = $scope.options.first.indexOf(newVal);

                if (index > -1)
                    $scope.options.first.splice(index, 1);
            });
        };


        $scope.modalDissmiss = function () {

        };

        $scope.switchCombine = function () {
            var temp = $scope.combination.first;
            $scope.combination.first = $scope.combination.second;
            $scope.combination.second = temp;
        };

        $scope.launchModal = function (elem, action) {
            $scope.selected = {};
            if (action == 'edit') {
                $scope.selected = $scope.lists[elem];
                angular.extend($scope.selected, {index: elem});
            }
            angular.extend($scope.modal, {type: action});
        };

        $scope.saveModal = function () {

            if ($scope.modal.type == 'edit') {
                angular.extend($scope.lists[$scope.selected.index], $scope.selected);

                var list = {
                    id: $scope.selected.id,
                    name: $scope.selected.name,
                    description: $scope.selected.description
                };

                userProteinList.update(user, list).$promise.then(
                    function () {
                        flash("alert-success", list.name + " list was successfully updated");
                    },
                    function (error) {
                        flash("alert-warning", error.message);
                    }
                )

            } else if ($scope.modal.type == 'create') {
                var newList = {name: $scope.selected.name, description: $scope.selected.description};

                userProteinList.combine(
                    user,
                    newList,
                    $scope.combination.first.name,
                    $scope.combination.second.name,
                    $scope.combination.op
                ).$promise.then(function (returnedList) {
                        returnedList.accessions = returnedList.accessionNumbers.length;
                        $scope.lists.push(returnedList);
                        $scope.options.first = $scope.options.second = $scope.lists;
                        flash("alert-success", newList.name + " was successfully created");
                    }, function (error) {
                        flash("alert-warning", error.data.message);
                    });
            }
        };

        // Remove from list
        function removeFromList(list, listId) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === listId) {
                    list.splice(i, 1);
                    break;
                }
            }
        }

        $scope.delete = function (list) {

            if (confirm("Are you sure you want to delete the " + list.name + " list ?")) {
                var listName = list.name;
                var listId = list.id;
                userProteinList.delete(user, listId).$promise.then(
                    function () {
                        removeFromList($scope.lists, listId);
                        $scope.options.first = $scope.options.second = $scope.lists;
                        flash("alert-success", listName + " was successfully deleted");
                    }, function (error) {
                        flash("alert-warning", error.data.message);
                    }
                )
            }
        }
    }

    ListCreateCtrl.$inject = ['$q', '$scope', '$rootScope', '$location', 'userProteinList', 'user', 'uploadListService', 'flash', '$log']
    function ListCreateCtrl($q, $scope, $rootScope, $location, userProteinList, user, uploadListService, flash, $log) {

        $scope.inputAccessions = "";
        $scope.listName = "";

        $scope.files = [];

        $rootScope.$on('upload:loadstart', function () {
            $log.info('Controller: on `loadstart`');
        });

        $rootScope.$on('upload:error', function () {
            $log.info('Controller: on `error`');
        });

        $scope.createList = function () {

            var list = {};

            // get accessions from text area
            if ($scope.inputAccessions.length > 0) {

                var accessions = $scope.inputAccessions.split("\n");

                list = {
                    name: $scope.listName,
                    description: $scope.listDescription,
                    accessions: accessions
                };
            } else {
                list = {
                    name: $scope.listName,
                    description: $scope.listDescription,
                    accessions: []
                }
            }

            userProteinList.create(user, list).$promise
                .then(function (newList) {

                    var promises = [$q.when(true)];

                    for (var i = $scope.files.length - 1; i >= 0; i--) {
                        promises.push(uploadListService.send(newList.id, $scope.files[i]));
                    }

                    $q.all(promises).then(function () {
                        flash('alert-info', "List " + $scope.listName + " created.");
                        $scope.files = [];
                        $location.path('/user/protein/lists');
                    }, function (o) {
                        flash('alert-warning', "List " + $scope.listName + " not created: " + o.data.message)
                    })
                }, function (o) {
                    flash('alert-warning', "List " + $scope.listName + " not created: " + o.data.message)
                })

        };

        $scope.removeUploadFile = function (index) {
            $scope.files.splice(index, 1);
        };

        $scope.isCreatable = function () {

            return ($scope.listName != "" && ( $scope.files.length > 0 || $scope.inputAccessions.length > 0 ) );
        };
    }
})(angular);



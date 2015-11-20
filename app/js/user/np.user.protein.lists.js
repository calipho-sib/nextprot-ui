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
        };


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

    ListCreateCtrl.$inject = ['$q', '$scope', '$rootScope',  'userProteinList', 'user', 'uploadListService', 'flash', '$log','$modal']
    function ListCreateCtrl($q, $scope, $rootScope, userProteinList, user, uploadListService, flash, $log, $modal) {

        $scope.clearForm = function() {

            $scope.listName = "";
            $scope.listDescription = "";
            $scope.inputAccessions = "";
            $scope.files = [];
        };

        $scope.isClearable = function() {

            return $scope.listName != "" || $scope.listDescription != "" ||
            $scope.inputAccessions != "" ||
            $scope.files.length > 0;
        };

        $scope.clearForm();

        $rootScope.$on('upload:loadstart', function () {
            $log.info('Controller: on `loadstart`');
        });

        $rootScope.$on('upload:error', function () {
            $log.info('Controller: on `error`');
        });

        function newList(listName, listDesc, accessions) {

            return {
                name: listName,
                description: listDesc,
                accessions: accessions
            };
        }

        /**
         * NX_P48730, NX_Q99558
         */
        function uploadAccessionsFromTextArea(textArea) {

            var accessions = textArea.split(/[\s\n,]+/);
            var list = newList($scope.listName, $scope.listDescription, accessions);

            userProteinList.create(user, list).$promise.then(function () {

                flash('alert-info', "List '" + $scope.listName + "' created.");
                $scope.clearForm();
            }, function (o) {

                var unknownEntries = o.data.properties["entriesNotFound"]

                var knownAccessions = accessions.filter(function(ac){ return unknownEntries.indexOf(ac) === -1; });

                $scope.inputAccessions = knownAccessions.join("\n");

                $scope.fromFiles = false;
                $scope.launchModal(unknownEntries);
            });
        }

        function uploadAccessionsFromFiles(ignoreNotFoundEntries) {

            var list = newList($scope.listName, $scope.listDescription,[]);

            // create an empty list and then update with accession file content
            userProteinList.create(user, list).$promise
                .then(function (newList) {

                    var resolvedList = [];

                    function push(o) {
                        resolvedList.push(o);
                    }

                    var promises = [$q.when(true)];

                    // "send()" now always resolves with a XMLHttpRequest or a RestErrorResponse object for unknown entries
                    for (var i = $scope.files.length - 1; i >= 0; i--) {
                        promises.push(uploadListService.send(newList.id, $scope.files[i], ignoreNotFoundEntries).then(push).catch(push));
                    }

                    /*
                     * The $q.all function returns a promise for an array of values. When this promise is fulfilled,
                     * the array contains the fulfillment values of the original promises, in the same order as those promises.
                     * If one of the given promises is rejected, the returned promise is immediately rejected, not waiting for
                     * the rest of the batch.
                     *
                     * The found solution above is based on http://stackoverflow.com/questions/20563042/angularjs-fail-resilence-on-q-all
                     */
                    $q.all(promises).then(function () {

                        // RestErrorResponse objects only
                        resolvedList = resolvedList.filter(function(elt) {
                            if (elt.hasOwnProperty("properties") && elt["properties"].length > 0) {
                                return elt;
                            }
                        });

                        if (resolvedList.length>0) {

                            userProteinList.delete(user, newList.id);

                            var unknownACs = resolvedList.map(function(item) {
                                return item["properties"]["entriesNotFound"];
                            });

                            var merged = [].concat.apply([], unknownACs);
                            $scope.fromFiles = true;
                            $scope.launchModal(merged);
                        } else {

                            flash('alert-info', "List '" + $scope.listName + "' created.");
                            $scope.clearForm();
                        }
                    });
                }, function (o) {
                    flash('alert-warning', "List '" + $scope.listName + "' not created: " + o.message);
                    userProteinList.delete(user, newList.id);
                    $scope.clearForm();
                })
        }

        $scope.createListAnyway = function () {

            if ($scope.fromFiles) {
                uploadAccessionsFromFiles(true);
            } else {

                if ($scope.inputAccessions.length > 0) {
                    uploadAccessionsFromTextArea($scope.inputAccessions);
                }
                else {
                    flash('alert-warning', "List '" + $scope.listName + "' not created: empty content");
                }
            }
        };

        $scope.launchModal = function (items) {
            if(!user.isAnonymous()){

                $scope.modal = { };
                angular.extend($scope.modal, {
                    listname: $scope.listName,
                    items: items
                });

                $modal({scope: $scope.$new(), template: 'partials/user/user-protein-list-creation-warning-modal.html', show: true});
            } else {
                flash('alert-warning', 'Please login to create a list');
            }
        };

        $scope.createList = function () {

            if ($scope.inputAccessions.length > 0) {
                uploadAccessionsFromTextArea($scope.inputAccessions);
            } else {
                uploadAccessionsFromFiles(false);
            }
        };

        $scope.cancelListCreation = function () {

            $scope.clearForm();
        };

        $scope.removeUploadFile = function (index) {

            $scope.files.splice(index, 1);

            console.log($scope.files)
        };

        $scope.isCreatable = function () {

            return ($scope.listName != "" && ( $scope.files.length > 0 || $scope.inputAccessions.length > 0 ) );
        };
    }
})(angular);



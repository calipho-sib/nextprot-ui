(function (angular, undefined) {
    'use strict';

    angular.module('np.chromosomes', ['ngRoute'])
        //.config(chromosomeRouting)
        .factory('chromosomeService', chromosomeService)
        .controller('chromosomeCtrl', chromosomeCtrl);

    /*chromosomeRouting.$inject = ['$routeProvider'];
    function chromosomeRouting($routeProvider) {

        $routeProvider
            .when('/chromosome-entries/:chromosome', {
                title:'Chromosome entries',
                templateUrl: '/partials/doc/main-doc.html'
            })
            .otherwise({
                redirectTo: '/chromosome-entries/all'
            })
    }*/

    chromosomeCtrl.$inject = ['$scope', 'chromosomeService', '$location', '$routeParams'];
    function chromosomeCtrl($scope, chromosomeService, $location, $routeParams) {

        $scope.chromosomeNames = chromosomeService.getChromosomeNames();
        $scope.chromosomeSelection = chromosomeService.getSelectedChromosome();

        $scope.selectChromosome = function(chromosome) {

            chromosomeService.selectChromosome(chromosome);

            $scope.isAllChromosomesSelected = (chromosome === "all");
        };

        $scope.getSelectedChromosome = function () {

            return chromosomeService.getSelectedChromosome();
        };

        $scope.displayAllChromosomes = function () {

            return this.chromosomeSelection === 'all';
        };

        $scope.activePage = function (page) {

            if ($location.url() === page) return 'active';
            else if ($routeParams.element === page)  return 'active';
            return '';
        }
    }

    chromosomeService.$inject = ['config', '$http'];
    function chromosomeService(config, $http) {

        var chromosomes = {
            selected : "all",
            pages : ["all"]
        };

        var ChromosomeService = function() {

            $http.get(config.api.API_URL + '/chromosome-names.json')
                .success(function (response) {
                    chromosomes.pages = chromosomes.pages.concat(response);
                })
                .catch(function (data, status) {
                    var message = status + ": cannot access list of chromosomes from '" + config.api.API_URL + "/chromosome-names.json'";
                    flash("alert-info", message);
                });
        };

        ChromosomeService.prototype.getChromosomeNames = function () {

            return chromosomes.pages;
        };

        ChromosomeService.prototype.selectChromosome = function (chromosome) {

            if (this.getChromosomeNames().indexOf(chromosome) >= 0) {
                chromosomes.selected = chromosome;
            }
            else {
                chromosomes.selected = "all";
            }
        };

        ChromosomeService.prototype.getSelectedChromosome = function() {

            return chromosomes.selected;
        };

        return new ChromosomeService();
    }
})(angular); //global variable
(function (angular, undefined) {
    'use strict';

    angular.module('np.chromosomes', ['ngRoute'])
        .factory('chromosomeService', chromosomeService)
        .controller('chromosomeCtrl', chromosomeCtrl);

    chromosomeCtrl.$inject = ['$scope', 'chromosomeService', '$location', '$routeParams', 'npSettings'];
    function chromosomeCtrl($scope, chromosomeService, $location, $routeParams, npSettings) {

        $scope.npEnv = {
            env: npSettings.environment
        };

        $scope.chromosomes = chromosomeService.getChromosomes();
        $scope.chromosomeSelection = chromosomeService.getSelectedPage();

        $scope.selectChromosome = function(chromosome) {

            chromosomeService.selectChromosome(chromosome);

            $scope.isAllChromosomesSelected = (chromosome === "all");
        };

        $scope.getSelectedPage = function () {

            return chromosomeService.getSelectedPage();
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
            names: ["all"],
            selected : "all",
            pages : {
                "all": {
                    "url": "all-chromosomes",
                    "title": "All chromosomes"
                }
            }
        };

        var ChromosomeService = function() {

            $http.get(config.api.API_URL + '/chromosomes.json')
                .success(function (response) {
                    chromosomes.names = chromosomes.names.concat(response);
                    var arrayLength = response.length;
                    for (var i = 0; i < arrayLength; i++) {
                        chromosomes.pages[response[i]] = {
                            "url": "chromosome-"+response[i],
                            "title": "Chromosome "+response[i]
                        };
                    }

                    console.log("CHROMOSOMES", chromosomes)
                })
                .catch(function (data, status) {
                    var message = status + ": cannot access list of chromosomes from '" + config.api.API_URL + "/chromosome-names.json'";
                    flash("alert-info", message);
                });
        };



        ChromosomeService.prototype.getChromosomes = function () {

            return chromosomes;
        };

        ChromosomeService.prototype.selectChromosome = function (chromosome) {

            if (this.getChromosomes().names.indexOf(chromosome) >= 0) {
                chromosomes.selected = chromosome;
            }
            else {
                chromosomes.selected = "all";
            }
        };

        ChromosomeService.prototype.getSelectedPage = function() {

            return chromosomes.selected;
        };

        return new ChromosomeService();
    }
})(angular); //global variable
(function (angular, undefined) {
    'use strict';

    angular.module('np.chromosomes', ['ngRoute'])
        .factory('chromosomeService', chromosomeService)
        .controller('chromosomeCtrl', chromosomeCtrl);

    chromosomeCtrl.$inject = ['$scope', 'chromosomeService', '$location', '$routeParams', 'npSettings','flash'];
    function chromosomeCtrl($scope, chromosomeService, $location, $routeParams, npSettings, flash) {

        $scope.npEnv = {
            env: npSettings.environment
        };

        $scope.chromosomes = chromosomeService.getChromosomes();

        $scope.selectChromosome = function(chromosome) {

            chromosomeService.selectChromosome(chromosome);

            $scope.isAllChromosomesSelected = (chromosome === "all");
        };

        $scope.getSelectedPage = function () {

            var sectionAndArticle = $routeParams.article.split("-");

            if (sectionAndArticle[0] === "all") {
                return "all";
            }

            if (chromosomeService.getChromosomes().names.indexOf(sectionAndArticle[1]) < 0) {

                var message = "cannot find chromosome "+sectionAndArticle[1];
                flash("alert-info", message);
                $location.path("entries/all-chromosomes").replace();
                return "all";
            }

            return sectionAndArticle[1];
        };

        $scope.displayAllChromosomes = function () {

            return this.getSelectedPage() === 'all';
        };

        $scope.activePage = function (page) {

            if ($location.url() === page) return 'active';
            else if ($routeParams.element === page)  return 'active';
            return '';
        }
    }

    chromosomeService.$inject = ['config', '$http','flash'];
    function chromosomeService(config, $http, flash) {

        var chromosomes = {
            names: ["all"],
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
                })
                .catch(function (data, status) {
                    var message = status + ": cannot access list of chromosomes from '" + config.api.API_URL + "/chromosome-names.json'";
                    flash("alert-info", message);
                });
        };

        ChromosomeService.prototype.getChromosomes = function () {

            return chromosomes;
        };

        return new ChromosomeService();
    }
})(angular); //global variable
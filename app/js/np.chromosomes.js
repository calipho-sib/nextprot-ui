(function (angular) {
    'use strict';

    var module = angular.module('np.chromosomes', ['ngRoute'])
        .service('chromosomeService', chromosomeService)
        .controller('chromosomeCtrl', chromosomeCtrl);

    module.run(function ($http, config, chromosomeService) {
        var chromosomeList = [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT", "unknown" ];
        var chromosomes = {
            names: ["all"],
            pages : {
                "all": {
                    "url": "all-chromosomes",
                    "title": "All chromosomes"
                }
            }
        }
        chromosomes.names = chromosomes.names.concat(chromosomeList);
        var arrayLength = chromosomeList.length;
        for (var i = 0; i < arrayLength; i++) {
            chromosomes.pages[chromosomeList[i]] = {
                "url": "chromosome-"+chromosomeList[i],
                "title": "Chromosome "+chromosomeList[i]
            };
        }
        chromosomeService.setChromosomes(chromosomes);
           
            
    });

    chromosomeCtrl.$inject = ['$scope', 'chromosomeService', '$location', '$routeParams', 'npSettings', 'flash'];
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

            if (!chromosomeService.hasChromosome(sectionAndArticle[1])) {

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

            if ($location.url() === page || $routeParams.element === page) {
                return 'active';
            }
            return '';
        }
    }

    function chromosomeService() {

        var chromosomes = null;

        return {
            setChromosomes: function(data) {
                chromosomes = data;
            },
            getChromosomes: function () {
                return chromosomes;
            },
            hasChromosome: function(chromosome) {
                return this.getChromosomes().names.indexOf(chromosome) >= 0;
            }
        };
    }
})(angular); //global variable
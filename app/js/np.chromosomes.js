(function (angular, undefined) {
    'use strict';

    angular.module('np.chromosomes', [])
        .factory('chromosomeService', chromosomeService)
        .controller('chromosomeCtrl', chromosomeCtrl);

    chromosomeCtrl.$inject = ['$scope', 'chromosomeService'];
    function chromosomeCtrl($scope, chromosomeService) {

        $scope.chromosomeNames = chromosomeService.getChromosomeNames();
    }

    chromosomeService.$inject = ['config', '$http'];
    function chromosomeService(config, $http) {

        var chromosomes = {
            selected : "",
            pages : ["all"]
        };

        var ChromosomeService = function() {

            $http.get(config.api.API_URL + '/chromosome-names.json')
                .success(function (response) {
                    console.log("response", response);
                    chromosomes.pages = chromosomes.pages.concat(response);
                })
                .error(function (data, status) {
                    var message = status + ": cannot access list of chromosomes from '" + config.api.API_URL + "/chromosome-names.json'";
                    $log.error(message);
                    flash("alert-info", message);
                });
        };

        ChromosomeService.prototype.getChromosomeNames = function () {

            return chromosomes.pages;
        };

        ChromosomeService.prototype.selectChromosomePage = function (chromosome) {

            if (this.getChromosomeNames().include(chromosome)) {
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
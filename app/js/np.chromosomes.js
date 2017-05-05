(function (angular, undefined) {
    'use strict';

    angular.module('np.chromosomes', ['ngRoute'])
        .config(chromosomeConfig)
        .service('chromosomeService', chromosomeService)
        .controller('chromosomeCtrl', chromosomeCtrl);

    chromosomeConfig.$inject = ['$routeProvider'];
    function chromosomeConfig($routeProvider) {

        console.log("FUCKING YOOOOOOOO")

        $routeProvider.when('/about/entries', {title:'Release Entries', templateUrl: '/partials/doc/entries.html'})
    }

    chromosomeCtrl.$inject = ['$scope', 'chromosomeService'];
    function chromosomeCtrl($scope, chromosomeService) {

        console.log("FUCKING YOOOOOOOO")

        console.log(chromosomeService.getChromosomeNames());
        $scope.chromosomeNames = chromosomeService.getChromosomeNames();
    }

    chromosomeService.$inject = ['config', '$http'];
    function chromosomeService(config, $http) {

        console.log("FUCKING YOOOOOOOO", config.api.API_URL + '/chromosome-names.json')

        var ChromosomeService = function() {

            var self = this;

            console.log("FUCKING YOOOOOOOO", config.api.API_URL + '/chromosome-names.json')

            $http.get(config.api.API_URL + '/chromosome-names.json')
                .success(function (response) {
                    console.log("response", response);
                    self.chromosomes = response;
                })
                .error(function (data, status) {
                    var message = status + ": cannot access list of chromosome names from '" + config.api.API_URL + "/chromosome-names.json'";
                    $log.error(message);
                    flash("alert-info", message);
                });
        };

        ChromosomeService.prototype.getChromosomeNames = function () {

            return this.chromosomes;
        };
        return new ChromosomeService();
    }
})(angular); //global variable
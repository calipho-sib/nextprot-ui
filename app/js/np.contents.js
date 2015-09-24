/**
 * Created by vrechdel on 18/09/15.
 */

(function (angular, undefined) {
    'use strict';

    angular.module('np.contents', [])
        .controller('ContentsCtrl', ContentsCtrl)
        .factory('contentsService', contentsService)
    ;

    ContentsCtrl.$inject = ['$scope','newsService'];
    function ContentsCtrl($scope, contentsService) {

        contentsService.getContents().$promise.then(function(data){
            $scope.contents = data;
        });

    }

    contentsService.$inject = ['$resource', 'config'];
    function contentsService($resource, config) {

        var contentsResource = $resource(
            config.api.API_URL + '/release-contents.json',
            {},
            {get : {method: "GET", isArray:true}});

        var ContentsService = function () {

        };

        ContentsService.prototype.getContents = function () {
            return contentsResource.get();
        };

        return new ContentsService();
    }

})(angular); //global variable

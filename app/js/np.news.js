(function (angular, undefined) {
    'use strict';

    angular.module('np.news', [])
        .controller('NewsCtrl', NewsCtrl)
        .factory('newsService', newsService)
    ;

    NewsCtrl.$inject = ['$scope','newsService'];
    function NewsCtrl($scope, newsService) {

        newsService.getNews().$promise.then(function(data){
            $scope.news = data.reverse();
        });

    }

    newsService.$inject = ['$resource', 'config'];
    function newsService($resource, config) {

        var newsResource = $resource(config.api.API_URL + '/news.json', {}, {get : {method: "GET", isArray:true}});

        var NewsService = function () {

        };

        NewsService.prototype.getNews = function () {
            return newsResource.get();
        };

        return new NewsService();
    }

})(angular); //global variable

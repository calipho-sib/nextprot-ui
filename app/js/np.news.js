(function (angular, undefined) {
    'use strict';

    angular.module('np.news', [])
        .controller('NewsCtrl', NewsCtrl)
        .factory('newsService', newsService)
//        .service('shareProperties', shareProperties)
    ;

    NewsCtrl.$inject = ['$scope','newsService'];
    function NewsCtrl($scope, newsService) {

        newsService.getNews().$promise.then(function(data){
            console.log("data NEWS");
            console.log(data);
            data.forEach(function(d){
                var dt = new Date(d.publicationDate);
                var day = dt.getDate();
                var year = dt.getFullYear().toString();
                var month = parseInt(dt.getMonth()) + 1;
                
                d["minDate"] = month + "/" + day + "/" + year.substring(2);
            })
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
//    function shareProperties(){
//        var properties = {
//            'title':''
//        };
//
//        return {
//            getProperty: function () {
//                return properties;
//            },
//            setProperty: function(value) {
//                properties.title = value;
//            }
//        };
//    }

})(angular); //global variable

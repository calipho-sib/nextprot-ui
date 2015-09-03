(function (angular, undefined) {
    'use strict';

    angular.module('np.news', [])
        .controller('NewsCtrl', NewsCtrl)
    ;

    NewsCtrl.$inject = ['$scope'];
    function NewsCtrl($scope) {

        $scope.news = [
            {
                "title": "HUPO Conference 2015",
                "publicationDate": 1440453600000,
                "url": "hupo-conf-2015",
                "publicationDateFormatted": "2015-08-25"
            },
            {
                "title": "New User Interface For neXtProt",
                "publicationDate": 1450047600000,
                "url": "new-gui",
                "publicationDateFormatted": "2015-12-14"
            }
        ];


    }


})(angular); //global variable

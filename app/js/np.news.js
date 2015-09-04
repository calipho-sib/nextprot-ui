(function (angular, undefined) {
    'use strict';

    angular.module('np.news', [])
        .controller('NewsCtrl', NewsCtrl)
    ;

    NewsCtrl.$inject = ['$scope'];
    function NewsCtrl($scope) {

        $scope.news = [
            {
                "title":"Google OAuth Support",
                "publicationDate":1415142000000,
                "url":"google-oauth-support",
                "publicationDateFormatted":"Nov 05, 2014"
            },{
                "title":"New User Interface",
                "publicationDate":1415142000000,
                "url":"new-user-interface",
                "publicationDateFormatted":"Nov 05, 2014"
            },{
                "title":"test",
                "publicationDate":1441317600000,
                "url":"test",
                "publicationDateFormatted":"Sep 04, 2015"}
        ];
        $scope.news = _.sortBy($scope.news, 'publicationDate').reverse();

    }


})(angular); //global variable

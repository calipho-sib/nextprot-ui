(function (angular, undefined) {'use strict';

angular.module('np.user', [
  'np.user.service',
  'np.user.query.service',
  'np.config'
])

.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/user', { templateUrl: 'partials/user/user-profile.html'})
      .when('/user/queries', { templateUrl: 'partials/user/user-queries.html'})
      .when('/user/applications', { templateUrl: 'partials/user/user-applications.html'})
  }
])


.controller('UserCtrl', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    '$http',
    '$window',
    '$timeout',
    'user',
    'flash',
    'config',
    function ($scope, $rootScope, $routeParams, $location, $http, $window, $timeout, user, flash, config) {
        $scope.user = user;
    }]
);

})(angular);

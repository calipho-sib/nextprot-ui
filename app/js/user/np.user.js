(function (angular, undefined) {'use strict';

angular.module('np.user', [
  'np.user.service', 
  'np.config'
])

.config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/user', { templateUrl: 'partials/user/user-profile.html'})
      .when('/user/queries', { redirectTo: '/user'})
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
    'User', 
    'flash', 
    'config',
    function ($scope, $rootScope, $routeParams, $location, $http, $window, $timeout, User, flash, config) {
        $scope.user = User;
    }]
);

})(angular);

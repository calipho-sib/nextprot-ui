'use strict';

angular.module('np.version.version-directive', [])

.directive('npVersion', ['version', function(version) {

  return function(scope, elm, attrs) {
    elm.text(version);
  };
}])
.directive('npBuild', ['build', function (build) {

  return function (scope, elm, attrs) {
    elm.text(build);
  };
}])
.directive('npBuildVersion', ['version', 'build', function (version, build) {

  return function (scope, elm, attrs) {

    var content = version;

    if (!isNaN(build))
      content += " (build "+build+")";

    elm.text(content);
  };
}]);

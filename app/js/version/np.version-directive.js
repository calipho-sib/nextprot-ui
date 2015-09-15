'use strict';

angular.module('np.version.directive', [])
    .directive('npBuildVersion', ['RELEASE_INFOS', function (RELEASE_INFOS) {

      return {
        restrict: 'AE',
        replace: true,
        scope: {},
        link: function(scope, element) {

          var content = RELEASE_INFOS.version;

          if (!isNaN(RELEASE_INFOS.build)) {

            content += " (build " + RELEASE_INFOS.build;
            if (RELEASE_INFOS.isProduction !== 'true') content += "#" + RELEASE_INFOS.githash;
            content += ")";
          }

          element.text(content);
        }
      }
}]);

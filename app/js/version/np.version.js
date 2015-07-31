'use strict';

angular.module('np.version', [
  'np.version.directive'
])

.value('version', '0.1.6')
.value('build', 'NX_BUILD');

'use strict';

angular.module('np.version', [
  'np.version.directive'
])

.value('version', '0.1.4')
.value('build', 'NX_BUILD');

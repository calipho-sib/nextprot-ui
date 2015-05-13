'use strict';

angular.module('np.version', [
  'np.version.directive'
])

.value('version', '0.1.3')
.value('build', 'NX_BUILD');

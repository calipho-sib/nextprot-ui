'use strict';

angular.module('np.version', [
  'np.version.directive'
])

.value('version', '0.1.5')
.value('build', 'NX_BUILD');

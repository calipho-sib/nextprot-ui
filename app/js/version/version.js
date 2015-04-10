'use strict';

angular.module('np.version', [
  'np.version.interpolate-filter',
  'np.version.version-directive'
])

.value('version', '1.0.1')
.value('build', 'NX_BUILD');

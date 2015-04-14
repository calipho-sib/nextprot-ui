'use strict';

angular.module('np.version', [
  'np.version.version-directive'
])

.value('version', '0.1.1')
.value('build', 'NX_BUILD');

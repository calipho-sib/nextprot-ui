(function (angular, undefined) {'use strict';

angular.module('np.user.protein.lists.ui', [])

.directive('fadeOnHover', ['$parse', '$timeout', function($parse, $timeout) {
	return function(scope, element, attr) {
		$timeout(function() {
			var e = angular.element(attr['fadeOnHover']);
			if(e.length) {
				e.bind('mouseenter', function() {
					element.fadeIn('fast');
				}).bind('mouseleave', function() {
					element.fadeOut('fast');
				});
			}
		}, 60);
		element.hide();
	}
}])

.directive('upload', ['UploadManager', function factory(UploadManager) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.fileUpload({
				dataType: 'text',
				add: function(e, data) {
					UploadManager.add(data);
				}
			});
		}
	};
}]);


})(angular);

(function (angular, undefined) {
    'use strict';

    angular.module('np.user.protein.lists.ui', [])

        .directive('fadeOnHover', ['$parse', '$timeout', function ($parse, $timeout) {
            return function (scope, element, attr) {
                $timeout(function () {
                    var e = angular.element(attr['fadeOnHover']);
                    if (e.length) {
                        e.bind('mouseenter', function () {
                            element.fadeIn('fast');
                        }).bind('mouseleave', function () {
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
                link: function (scope, element, attrs) {
                    element.fileUpload({
                        dataType: 'text',
                        add: function (e, data) {
                            UploadManager.add(data);
                        }
                    });
                }
            };
        }])

        .directive('fileChange', function () {
            var linker = function ($scope, element, attributes) {

                // onChange, push the files to $scope.files.
                element.bind('change', function (event) {

                    var files = event.target.files;

                    $scope.$apply(function () {
                        for (var i = 0, length = files.length; i < length; i++) {
                            $scope.files.push(files[i]);
                        }
                    });
                });
            };

            return {
                restrict: 'A',
                link: linker
            };
        });
})(angular);

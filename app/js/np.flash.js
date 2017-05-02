(function (angular, undefined) {'use strict';


var flash = angular.module('np.flash', [])
	.factory('flash', flashImp)
//      .directive('flashMsg', flashMsg)
        .controller('flashCtrl',flashCtrl); 


flashImp.$inject=['$rootScope', '$timeout'];
function flashImp($rootScope, $timeout) {
    var messages = [];
    var reset;
    var cleanup = function() {
    	reset = $timeout(function() { messages = []; });
    	//$timeout.cancel(reset);
    };

    var emit = function() {
    	$rootScope.$emit('flash:ms', messages, cleanup);
    };

    $rootScope.$on('$locationChangeSuccess', emit);

    var asMessage = function(level, text) {
      if (!text) {
        text = level;
        level = 'alert-info';
      }
      return { level: level, text: text };
    };

    var asArrayOfMessages = function(level, text) {
      if (level instanceof Array) return level.map(function(message) {
        return message.text ? message : asMessage(message);
      });
      return text ? [{ level: level, text: text }] : [asMessage(level)];
    };

    var flash = function(level, text) {
      emit(messages = asArrayOfMessages(level, text));

      if(level == 'alert-info' || level == 'alert-success'){
        //to remove the messages after a timeout
        $timeout(function() { messages = []; emit();}, 3000);
      }
    };

    ['alert-danger', 'alert-warning', 'alert-info', 'alert-success'].forEach(function (level) {
      flash[level] = function (text) { flash(level, text); };
    });

    return flash;
};

// Mario style (with the template in the js)
flashCtrl.$inject = ['$scope','$rootScope','$timeout'];
function flashCtrl($scope,$rootScope, $timeout){
    $scope.messageList = [];
    
    $rootScope.$on('flash:ms', function (_, messages, done) {
        $scope.messageList = messages;
        done();
    });
}
//    flashMsg.$inject = [];
//    function flashMsg() {
//        var directive = {restrict: 'EA', replace: true};
//
//        directive.template =
//            '<ul style="position: fixed;top: -2px;left: 15%;right: 15%;z-index:10010;opacity:0.9">' +
//            '<li style="list-style: none " ng-repeat="m in messages">' +
//            '<div  class="flashmsg alert alert-dismissible" role="alert">' +
//            '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span>' +
//            '<span class="sr-only">Close</span></button>' +
//            '<span ng-bind="m.text"></span>' +
////            '{{m.text}}ezez' +
//            '</div>' +
//            '</li>' +
//            '</ul>';
//
//        directive.controller = ['$scope', '$rootScope', function ($scope, $rootScope) {
//            $rootScope.$on('flash:msg', function (_, messages, done) {
//                console.log("message send !!!", messages);
//                $scope.messages = messages;
//                done();
//            });
//        }];
//
//        return directive;
//    }



// Olivier style (with the template in the html)
//.directive('flash', ['$rootScope',function ($rootScope) {
//    return function (scope, elm, attrs) {
//        $rootScope.$on('flash:message', function(_, messages, done) {
//            scope.messages = messages;
//            done();
//        });
//    };
//}]);
})(angular);

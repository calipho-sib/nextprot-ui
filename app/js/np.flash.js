(function (angular, undefined) {'use strict';


var flash = angular.module('np.flash', [])
	.factory('flash', flashImp)
      .directive('flashMessages', flashMessages); 


flashImp.$inject=['$rootScope', '$timeout'];
function flashImp($rootScope, $timeout) {
    var messages = [];
    var reset;
    var cleanup = function() {
    	reset = $timeout(function() { messages = []; });
    	//$timeout.cancel(reset);
    };

    var emit = function() {
    	$rootScope.$emit('flash:message', messages, cleanup);
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
    flashMessages.$inject = [];
    function flashMessages() {
        var directive = {restrict: 'EA', replace: true};

        directive.template =
            '<ul style="position: fixed;top: -2px;left: 15%;right: 15%;z-index:10010;opacity:0.9">' +
            '<li style="list-style: none " ng-repeat="m in messages">' +
            '<div  class="flashmsg alert {{m.level}} alert-dismissible" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span>' +
            '<span class="sr-only">Close</span></button>' +
            '{{m.text}}' +
            '</div>' +
            '</li>' +
            '</ul>';

        directive.controller = ['$scope', '$rootScope', function ($scope, $rootScope) {
            $rootScope.$on('flash:message', function (_, messages, done) {
                $scope.messages = messages;
                done();
            });
        }];

        return directive;
    }



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

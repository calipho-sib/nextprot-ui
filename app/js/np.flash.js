'use strict'

var flash = angular.module('np.flash', [])
	.factory('flash', ['$rootScope', '$timeout', function($rootScope, $timeout) {
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
            $timeout(function() { messages = []; emit();}, 2000);
        }

   	};

  	['alert-danger', 'alert-warning', 'alert-info', 'alert-success'].forEach(function (level) {

    	flash[level] = function (text) { flash(level, text); };
  	});

  	return flash;
}])

// Mario style (with the template in the js)
.directive('flashMessages', [function() {
  var directive = { restrict: 'EA', replace: true };

        directive.template = '<ul class="unstyled" style="position: absolute;top: 45px;left: 15%;right: 15%;z-index:1;opacity:0.9">' +
            '<li ng-repeat="m in messages">' +
            '<button type="button" class="close" style="padding-right: 5px" data-dismiss="alert">&times;</button>' +
            '<div style="border-width: 1px; border-color: lightgray" class="alert {{m.level}}">{{m.text}}</div>' +
            '</li>' +
            '</ul>';

        directive.controller = ['$scope', '$rootScope', function($scope, $rootScope) {
    $rootScope.$on('flash:message', function(_, messages, done) {
      $scope.messages = messages;
      done();
    });
  }];

  return directive;
}])



// Olivier style (with the template in the html)
//.directive('flash', ['$rootScope',function ($rootScope) {
//    return function (scope, elm, attrs) {
//        $rootScope.$on('flash:message', function(_, messages, done) {
//            scope.messages = messages;
//            done();
//        });
//    };
//}]);

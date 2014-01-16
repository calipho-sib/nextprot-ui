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

    	$timeout(function() { messages = []; emit();}, 3000);
  	};

  	['alert-danger', 'alert-warning', 'alert-info', 'alert-success'].forEach(function (level) {

    	flash[level] = function (text) { flash(level, text); };
  	});

  	return flash;
}])

.directive('flashMessages', [function() {
  var directive = { restrict: 'EA', replace: true };

  directive.template = '<ul class="unstyled" style="margin-top: 40px">' +
  							'<li ng-repeat="m in messages"><div class="alert {{m.level}}">{{m.text}}</div></li>'+
  						'</ul>';


  directive.controller = ['$scope', '$rootScope', function($scope, $rootScope) {
    $rootScope.$on('flash:message', function(_, messages, done) {
      $scope.messages = messages;
      done();
    });
  }];

  return directive;
}]);
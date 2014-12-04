(function () {
  angular.module('auth', [
    'auth0.storage',
    'auth0.service',
    'auth0.interceptor',
    'auth0.utils'
  ]);
  angular.module('auth0.utils', []).provider('authUtils', function () {
    var Utils = {
        capitalize: function (string) {
          return string ? string.charAt(0).toUpperCase() + string.substring(1).toLowerCase() : null;
        },
        urlBase64Decode: function (str) {
          var output = str.replace('-', '+').replace('_', '/');
          switch (output.length % 4) {
          case 0: {
              break;
            }
          case 2: {
              output += '==';
              break;
            }
          case 3: {
              output += '=';
              break;
            }
          default: {
              throw 'Illegal base64url string!';
            }
          }
          return window.atob(output);  //polifyll https://github.com/davidchambers/Base64.js
        }
      };
    angular.extend(this, Utils);
    this.$get = [
      '$rootScope',
      '$q',
      function ($rootScope, $q) {
        var authUtils = {};
        angular.extend(authUtils, Utils);
        authUtils.safeApply = function (fn) {
          var phase = $rootScope.$root.$$phase;
          if (phase === '$apply' || phase === '$digest') {
            if (fn && typeof fn === 'function') {
              fn();
            }
          } else {
            $rootScope.$apply(fn);
          }
        };
        authUtils.promisify = function (nodeback, self) {
          if (angular.isFunction(nodeback)) {
            return function (args) {
              args = Array.prototype.slice.call(arguments);
              var dfd = $q.defer();
              var callback = function (err, response, etc) {
                if (err) {
                  dfd.reject(err);
                }
                // if more arguments then turn into an array for .spread()
                etc = Array.prototype.slice.call(arguments, 1);
                dfd.resolve(etc.length > 1 ? etc : response);
              };
              args.push(authUtils.applied(callback));
              nodeback.apply(self, args);
              // spread polyfill only for promisify
              dfd.promise.spread = dfd.promise.spread || function (fulfilled, rejected) {
                return dfd.promise.then(function (array) {
                  return Array.isArray(array) ? fulfilled.apply(null, array) : fulfilled(array);
                }, rejected);
              };
              return dfd.promise;
            };
          }
        };
        authUtils.applied = function (fn) {
          // Adding arguments just due to a bug in Auth0.js.
          /*jshint ignore:start */
          return function (err, response) {
            /*jshint ignore:end */
            var argsCall = arguments;
            authUtils.safeApply(function () {
              fn.apply(null, argsCall);
            });  /*jshint ignore:start */
          };  /*jshint ignore:end */
        };
        return authUtils;
      }
    ];
  });
  angular.module('auth0.interceptor', []).factory('authInterceptor', [
    '$rootScope',
    '$q',
    '$injector',
    function ($rootScope, $q, $injector) {
      return {
        request: function (config) {
          // When using auth dependency is never loading, we need to do this manually
          // This issue should be related with: https://github.com/angular/angular.js/issues/2367
          if (!$injector.has('auth')) {
            return config;
          }
          var auth = $injector.get('auth');
          config.headers = config.headers || {};
          if (auth.idToken && !config.headers.Authorization) {
            config.headers.Authorization = 'Bearer ' + auth.idToken;
          }
          return config;
        },
        responseError: function (response) {
          // handle the case where the user is not authenticated
          if (response.status === 401) {
            $rootScope.$broadcast('auth0.forbidden', response);
          }
          return $q.reject(response);
        }
      };
    }
  ]);
  angular.module('auth0.storage', ['ngCookies']).service('authStorage', [
    '$cookieStore',
    function ($cookieStore) {
      this.store = function (idToken, accessToken, state) {
        $cookieStore.put('idToken', idToken);
        $cookieStore.put('accessToken', accessToken);
        if (state) {
          $cookieStore.put('state', state);
        }
      };
      this.get = function () {
        return {
          idToken: $cookieStore.get('idToken'),
          accessToken: $cookieStore.get('accessToken'),
          state: $cookieStore.get('state')
        };
      };
      this.remove = function () {
        $cookieStore.remove('idToken');
        $cookieStore.remove('accessToken');
        $cookieStore.remove('state');
      };
    }
  ]);
  angular.module('auth0.service', [
    'auth0.storage',
    'auth0.utils'
  ]).provider('auth', [
    'authUtilsProvider',
    function (authUtilsProvider) {
      var defaultOptions = { callbackOnLocationHash: true };
      var config = this;
      this.init = function (options, Auth0Constructor) {
        if (!Auth0Constructor && typeof Auth0Widget === 'undefined' && typeof Auth0 === 'undefined') {
          throw new Error('You must add either Auth0Widget.js or Auth0.js');
        }
        if (!options) {
          throw new Error('You must set options when calling init');
        }
        this.loginUrl = options.loginUrl;
        this.loginState = options.loginState;
        this.clientID = options.clientID;
        this.sso = options.sso;
        var Constructor = Auth0Constructor;
        if (!Constructor && typeof Auth0Widget !== 'undefined') {
          Constructor = Auth0Widget;
        }
        if (!Constructor && typeof Auth0 !== 'undefined') {
          Constructor = Auth0;
        }
        this.auth0lib = new Constructor(angular.extend(defaultOptions, options));
        if (this.auth0lib.getClient) {
          this.auth0js = this.auth0lib.getClient();
          this.isWidget = true;
        } else {
          this.auth0js = this.auth0lib;
          this.isWidget = false;
        }
      };
      this.eventHandlers = {};
      this.on = function (anEvent, handler) {
        if (!this.eventHandlers[anEvent]) {
          this.eventHandlers[anEvent] = [];
        }
        this.eventHandlers[anEvent].push(handler);
      };
      var events = [
          'loginSuccess',
          'loginFailure',
          'logout',
          'forbidden'
        ];
      angular.forEach(events, function (anEvent) {
        config['add' + authUtilsProvider.capitalize(anEvent) + 'Handler'] = function (handler) {
          config.on(anEvent, handler);
        };
      });
      this.$get = [
        '$rootScope',
        '$q',
        '$injector',
        'authStorage',
        '$window',
        '$location',
        'authUtils',
        function ($rootScope, $q, $injector, authStorage, $window, $location, authUtils) {
          var auth = { isAuthenticated: false };
          var getHandlers = function (anEvent) {
            return config.eventHandlers[anEvent];
          };
          var callHandler = function (anEvent, locals) {
            angular.forEach(getHandlers(anEvent) || [], function (handler) {
              $injector.invoke(handler, auth, locals);
            });
          };
          // SignIn
          var onSigninOk = function (idToken, accessToken, state, locationEvent) {
            authStorage.store(idToken, accessToken, state);
            var profilePromise = auth.getProfile(idToken);
            var response = {
                idToken: idToken,
                accessToken: accessToken,
                state: state,
                isAuthenticated: true
              };
            angular.extend(auth, response);
            callHandler('loginSuccess', angular.extend({
              profile: profilePromise,
              locationEvent: locationEvent
            }, response));
            return profilePromise;
          };
          function forbidden() {
            authStorage.remove();
            if (config.loginUrl) {
              $location.path(config.loginUrl);
            } else if (config.loginState) {
              $injector.get('$state').go(config.loginState);
            } else {
              callHandler('forbidden');
            }
          }
          // Redirect mode
          $rootScope.$on('$locationChangeStart', function (e) {
            var hashResult = config.auth0lib.parseHash($window.location.hash);
            if (!auth.isAuthenticated) {
              if (hashResult && hashResult.id_token) {
                onSigninOk(hashResult.id_token, hashResult.access_token, hashResult.state, e);
                return;
              }
              var storedValues = authStorage.get();
              if (storedValues && storedValues.idToken) {
                if (auth.hasTokenExpired(storedValues.idToken)) {
                  forbidden();
                  return;
                }
                onSigninOk(storedValues.idToken, storedValues.accessToken, storedValues.state, e);
                return;
              }
              if (config.sso) {
                config.auth0js.getSSOData(authUtils.applied(function (err, ssoData) {
                  if (ssoData.sso) {
                    auth.signin({
                      popup: false,
                      connection: ssoData.lastUsedConnection.strategy
                    }, config.auth0js);
                  }
                }));
              }
            }
          });
          $rootScope.$on('auth0.forbidden', function () {
            forbidden();
          });
          if (config.loginUrl) {
            $rootScope.$on('$routeChangeStart', function (e, nextRoute) {
              if (nextRoute.$$route && nextRoute.$$route.requiresLogin) {
                if (!auth.isAuthenticated) {
                  $location.path(config.loginUrl);
                }
              }
            });
          }
          if (config.loginState) {
            $rootScope.$on('$stateChangeStart', function (e, to) {
              if (to.data && to.data.requiresLogin) {
                if (!auth.isAuthenticated) {
                  e.preventDefault();
                  $injector.get('$state').go(config.loginState);
                }
              }
            });
          }
          // Start auth service
          auth.config = config;
          var checkHandlers = function (options) {
            var successHandlers = getHandlers('loginSuccess');
            if (!options.popup && !options.username && (!successHandlers || successHandlers.length === 0)) {
              throw new Error('You must define a loginSuccess handler ' + 'if not using popup mode or not doing ro call because that means you are doing a redirect');
            }
          };
          auth.hookEvents = function () {
          };
          auth.hasTokenExpired = function (token) {
            if (!token) {
              return true;
            }
            var parts = token.split('.');
            if (parts.length !== 3) {
              return true;
            }
            var decoded = authUtils.urlBase64Decode(parts[1]);
            if (!decoded) {
              return true;
            }
            try {
              decoded = JSON.parse(decoded);
            } catch (e) {
              return true;
            }
            if (!decoded.exp) {
              return true;
            }
            var d = new Date(0);
            // The 0 here is the key, which sets the date to the epoch
            d.setUTCSeconds(decoded.exp);
            if (isNaN(d)) {
              return true;
            }
            // Token expired?
            if (d.valueOf() > new Date().valueOf()) {
              // No
              return false;
            } else {
              // Yes
              return true;
            }
          };
          auth.getToken = function (clientID, options) {
            options = options || { scope: 'openid' };
            var getDelegationTokenAsync = authUtils.promisify(config.auth0js.getDelegationToken, config.auth0js);
            return getDelegationTokenAsync(clientID, auth.idToken, options).then(function (delegationResult) {
              return delegationResult.id_token;
            });
          };
          auth.refreshToken = function (options) {
            return auth.getToken(config.clientID, options);
          };
          auth.signin = function (options, lib) {
            options = options || {};
            options.scope = 'openid email name picture';
            console.log("here are the options", options)

            checkHandlers(options);
            var auth0lib = lib || config.auth0lib;
            var signinPromisify = authUtils.promisify(auth0lib.signin, auth0lib);
            var signinAsync = config.isWidget ? signinPromisify(options, null) : signinPromisify(options);
            return signinAsync.spread(function (profile, idToken, accessToken, state) {
              return onSigninOk(idToken, accessToken, state);
            })['catch'](function (err) {
              callHandler('loginFailure', { error: err });
              throw err;
            });
          };
          auth.signup = function (options) {
            options = options || {};
            checkHandlers(options);
            var auth0lib = config.auth0lib;
            var signupPromisify = authUtils.promisify(auth0lib.signup, auth0lib);
            var signupAsync = config.isWidget ? signupPromisify(options, null) : signupPromisify(options);
            return signupAsync.spread(function (profile, idToken, accessToken, state) {
              return onSigninOk(idToken, accessToken, state);
            })['catch'](function (err) {
              callHandler('loginFailure', { error: err });
              throw err;
            });
          };
          auth.reset = function (options) {
            options = options || {};
            var auth0lib = config.auth0lib;
            var resetPromisify = authUtils.promisify(auth0lib.reset, auth0lib);
            return config.isWidget ? resetPromisify(options, null) : resetPromisify(options);
          };
          auth.signout = function () {
            authStorage.remove();
            auth.profile = null;
            auth.idToken = null;
            auth.state = null;
            auth.accessToken = null;
            auth.isAuthenticated = false;
            callHandler('logout');
          };
          auth.getProfile = function (idToken) {
            var getProfilePromisify = authUtils.promisify(config.auth0lib.getProfile, config.auth0lib);
            return getProfilePromisify(idToken || auth.idToken).then(function (profile) {
              auth.profile = profile;
              return profile;
            });
          };
          return auth;
        }
      ];
    }
  ]);
}());
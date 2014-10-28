(function () {
  // TODO Change module name to something more neutral to avoid namespace clash
  var util = angular.module('util', []);
  //this is used to parse the profile
  util.value('urlBase64Decode', function (str) {
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
  });
  var auth0 = angular.module('auth', [
      'util',
      'ngCookies'
    ]);
  var AUTH_EVENTS = {
      forbidden: 'auth:FORBIDDEN',
      loginSuccess: 'auth:LOGIN_SUCCESS',
      loginFailure: 'auth:LOGIN_FAILED',
      loginFailed: 'auth:LOGIN_FAILED',
      logout: 'auth:LOGOUT',
      redirectEnded: 'auth:REDIRECT_ENDED'
    };
  auth0.constant('AUTH_EVENTS', AUTH_EVENTS);
  function Auth0Wrapper(auth0Lib, $cookieStore, $rootScope, $q, urlBase64Decode, $timeout) {
    this.auth0Lib = auth0Lib;
    this.$cookieStore = $cookieStore;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$timeout = $timeout;
    this.urlBase64Decode = urlBase64Decode;
    this.delegatedTokens = {};
    this.profile = {};
    this._loaded = $q.defer();
    this.loaded = this._loaded.promise;
  }
  Auth0Wrapper.prototype = {};
  Auth0Wrapper.prototype.parseHash = function (locationHash, callback) {
    this.auth0Lib.parseHash(locationHash, callback);
  };
  Auth0Wrapper.prototype._deserialize = function () {
    var idToken;
    try {
      idToken = this.$cookieStore.get('idToken');
    } catch (e) {
      idToken = undefined;
    }
    if (!idToken || this.hasTokenExpired(idToken)) {
      this.isAuthenticated = false;
      this.idToken = undefined;
      this.accessToken = undefined;
      // Serialize values if token has expired
      this._serialize(undefined, undefined, undefined);
      return;
    }
    this.idToken = this.$cookieStore.get('idToken');
    this.accessToken = this.$cookieStore.get('accessToken');
    this.state = this.$cookieStore.get('state');
    this.isAuthenticated = true;
  };
  function setOrRemoveFromCookieStore($cookieStore, fieldName, field) {
    if (field) {
      $cookieStore.put(fieldName, field);
    } else {
      $cookieStore.remove(fieldName);
    }
  }
  Auth0Wrapper.prototype._serialize = function (id_token, access_token, state) {
    setOrRemoveFromCookieStore(this.$cookieStore, 'idToken', id_token);
    setOrRemoveFromCookieStore(this.$cookieStore, 'accessToken', access_token);
    setOrRemoveFromCookieStore(this.$cookieStore, 'state', state);
  };
  Auth0Wrapper.prototype.hasTokenExpired = function (token) {
    if (!token) {
      return true;
    }
    var parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    var decoded = this.urlBase64Decode(parts[1]);
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
  Auth0Wrapper.prototype.getToken = function (clientID, options, forceRenewal) {
    options = options || { scope: 'openid profile' };
    var that = this;
    var deferred = that.$q.defer();
    if (forceRenewal) {
      this.delegatedTokens[clientID] = undefined;
    }
    var existingToken = this.delegatedTokens[clientID];
    var isExpired = this.hasTokenExpired(existingToken);
    // If token was already retrieved and is not expired return it
    if (existingToken && !isExpired) {
      deferred.resolve(existingToken);
      return deferred.promise;
    }
    var obj = this.auth0Lib;
    // Case where auth0Lib is the widget (which does not expose
    // getDelegationToken directly).
    if (!obj.getDelegationToken) {
      obj = obj.getClient();
    }
    obj.getDelegationToken(clientID, this.idToken, options, function (err, delegationResult) {
      that.$timeout(function () {
        if (err) {
          return deferred.reject(err);
        }
        that.delegatedTokens[clientID] = delegationResult.id_token;
        return deferred.resolve(delegationResult.id_token);
      });
    });
    return deferred.promise;
  };
  Auth0Wrapper.prototype.signin = function (options) {
    options = options || {};
    var that = this;
    var $q = that.$q;
    var defer = $q.defer();
    var callback = function (err, profile, id_token, access_token, state) {
      that.$timeout(function () {
        if (err) {
          that.$rootScope.$broadcast(AUTH_EVENTS.loginFailure, err);
          defer.reject(err);
          return;
        }
        that._serialize(id_token, access_token, state);
        that._deserialize();
        that.getProfile(id_token).then(function () {
          that.$rootScope.$broadcast(AUTH_EVENTS.loginSuccess, that.profile);
          defer.resolve(that.profile);
        }, function (err) {
          that.$rootScope.$broadcast(AUTH_EVENTS.loginFailure, err);
          defer.reject(err);
        });
      });
    };
    // Auth0 Widget special cases
    // XXX We detect the widget by asking if it has defined getClient method,
    // this is the safest way as if using that.auth0Lib.constructor.name changes
    // when minifying happens.
    if (that.auth0Lib && that.auth0Lib.getClient) {
      if (options.popup) {
        // Auth0 widget & popup mode (popup: true) callback is the third parameter
        that.auth0Lib.signin(options, null, callback);
        return defer.promise;
      }
      // In Auth0 widget the callback to signin is executed when the widget ends
      // loading. In that case, we should not broadcast any event.
      callback = null;
    }
    if (options.auth0jscall) {
      var caller = that.auth0Lib.getClient ? that.auth0Lib.getClient() : that.auth0lib;
      caller.signin(options, callback);
    } else {
      that.auth0Lib.signin(options, callback);
    }
    return defer.promise;
  };
  Auth0Wrapper.prototype.signout = function () {
    var that = this;
    this._serialize(undefined, undefined, undefined);
    this._deserialize();
    // Cleanup profile
    Object.keys(that.profile).forEach(function (key) {
      delete that.profile[key];
    });
    // Cleanup delegatedTokens
    Object.keys(that.delegatedTokens).forEach(function (key) {
      delete that.delegatedTokens[key];
    });
    this.$rootScope.$broadcast(AUTH_EVENTS.logout);
  };
  Auth0Wrapper.prototype.parseHash = function (locationHash) {
    return this.auth0Lib.parseHash(locationHash);
  };
  Auth0Wrapper.prototype.getProfile = function (token) {
    var deferred = this.$q.defer();
    var that = this;
    var wrappedCallback = function (err, profile) {
      that.$timeout(function () {
        if (err) {
          return deferred.reject(err);
        }
        // Cleanup old keys
        Object.keys(that.profile).forEach(function (key) {
          delete that.profile[key];
        });
        // Add new keys
        Object.keys(profile).forEach(function (key) {
          that.profile[key] = profile[key];
        });
        deferred.resolve(that.profile);
      });
    };
    this.auth0Lib.getProfile(token, wrappedCallback);
    return deferred.promise;
  };
  Auth0Wrapper.prototype.signup = function (options) {
    this.auth0Lib.signup(options);
  };
  Auth0Wrapper.prototype.reset = function (options) {
    this.auth0Lib.reset(options);
  };
  auth0.provider('auth', [
    '$provide',
    function ($provide) {
      var auth0Wrapper;
      /**
     * Initializes the auth service.
     *
     * this.init(options, [Auth0Constructor])
     *
     * @param {Object} options Options for auth0.js or widget
     * @param {function} Auth0Constructor (optional) constructor used to create auth0Lib
     */
      this.init = function (options, Auth0Constructor) {
        var auth0Lib;
        if (options.callbackOnLocationHash === undefined) {
          options.callbackOnLocationHash = true;
        }
        if (Auth0Constructor) {
          auth0Lib = new Auth0Constructor(options);
        } else {
          // User has included Auth0 widget
          if (typeof Auth0Widget !== 'undefined') {
            auth0Lib = new Auth0Widget(options);
          } else if (typeof Auth0 !== 'undefined') {
              alert('yaaa');
            auth0Lib = new Auth0(options);
          } else {
            throw new Error('Auth0Widget or Auth0.js dependency not found');
          }
        }
        $provide.value('auth0Lib', auth0Lib);
      };
      this.$get = [
        '$cookieStore',
        '$rootScope',
        '$q',
        '$injector',
        'urlBase64Decode',
        '$timeout',
        function ($cookieStore, $rootScope, $q, $injector, urlBase64Decode, $timeout) {
          // We inject auth0Lib manually in order to throw a friendly error
          var auth0Lib = $injector.get('auth0Lib');
          if (!auth0Lib) {
            throw new Error('auth0Lib dependency not found. Have you called authProvider.init?');
          }
          if (!auth0Wrapper) {
            auth0Wrapper = new Auth0Wrapper(auth0Lib, $cookieStore, $rootScope, $q, urlBase64Decode, $timeout);
            if (!$injector.has('parseHash')) {
              auth0Wrapper._deserialize();
              auth0Wrapper.getProfile(auth0Wrapper.idToken).finally(function () {
                auth0Wrapper._loaded.resolve();
                $rootScope.$broadcast(AUTH_EVENTS.redirectEnded);
              });
            }
          }
          return auth0Wrapper;
        }
      ];
    }
  ]);
  var auth0Redirect = angular.module('auth0-redirect', ['auth0']);
  auth0Redirect.factory('parseHash', [
    'auth',
    '$rootScope',
    '$window',
    function (auth, $rootScope, $window) {
      return function () {
        var result = auth.parseHash($window.location.hash);
        function onAuthSuccess() {
          if (result && result.id_token) {
            auth._serialize(result.id_token, result.access_token, result.state);
          }
          // this will rehydrate the "auth" object with the profile stored in $cookieStore
          auth._deserialize();
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, auth.profile);
        }
        function onAuthFail(err) {
          // this will rehydrate the "auth" object with the profile stored in $cookieStore
          auth._deserialize();
          $rootScope.$broadcast(AUTH_EVENTS.loginFailure, err);
        }
        function onRedirectEnded() {
          auth._loaded.resolve();
          $rootScope.$broadcast(AUTH_EVENTS.redirectEnded);
        }
        // this will rehydrate the "auth" object with the profile stored in $cookieStore
        auth._deserialize();
        // already logged in
        if (auth.idToken) {
          auth.getProfile(auth.idToken).then(onAuthSuccess, onAuthFail).finally(onRedirectEnded);  // callback URL
        } else if (result && result.id_token) {
          auth.getProfile(result.id_token).then(onAuthSuccess, onAuthFail).finally(onRedirectEnded);  // page reloaded, not logged in
        } else {
          onRedirectEnded();
        }
      };
    }
  ]);
  auth0Redirect.run([
    'parseHash',
    function (parseHash) {
      parseHash();
    }
  ]);
  var authInterceptorModule = angular.module('authInterceptor', ['auth']);
  authInterceptorModule.factory('authInterceptor', [
    '$rootScope',
    '$q',
    'AUTH_EVENTS',
    '$injector',
    function ($rootScope, $q, AUTH_EVENTS, $injector) {
      return {
        request: function (config) {
          // When using auth dependency is never loading, we need to do this manually
          // This issue should be related with: https://github.com/angular/angular.js/issues/2367
          if (!$injector.has('auth')) {
            return config;
          }
          var auth = $injector.get('auth');
          config.headers = config.headers || {};
          if (auth.idToken) {
            config.headers.Authorization = 'Bearer ' + auth.idToken;
          }
          return config;
        },
        responseError: function (response) {
          // handle the case where the user is not authenticated
          if (response.status === 401) {
            $rootScope.$broadcast(AUTH_EVENTS.forbidden, response);
          }
          return $q.reject(response);
        }
      };
    }
  ]);
}());
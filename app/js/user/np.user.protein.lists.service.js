(function (angular, undefined) {
    'use strict';

// create the module and define one service
    angular.module('np.user.protein.lists.service', [])
        .factory('userProteinList', userProteinList)
        .factory('uploadListService', uploadListService);


//
// implement the service
    userProteinList.$inject = ['$resource', 'config', '$q'];
    function userProteinList($resource, config, $q) {

        var Proteins = function () {

            this.$daoLists = $resource(config.api.API_URL + '/lists/:id',
                {}, {
                    get: {method: 'GET'},
                    list: {method: 'GET', isArray: true}
                });


            this.$dao = $resource(config.api.API_URL + '/user/me/lists/:id/:action',
                {id: '@id', action: '@action'}, {
                    get: {method: 'GET', isArray: false},
                    list: {method: 'GET', isArray: true},
                    create: {method: 'POST'},
                    update: {method: 'PUT'},
                    fix: {method: 'PUT'}
                });

            //
            // wrap promise to this object
            this.$promise = $q.when(this)
        };

        Proteins.prototype.list = function (user) {
            var self = this;
            self.$promise = self.$dao.list({}).$promise;
            self.$promise.then(function (data) {
                // TODO: weird to refer service that is an instance of Proteins !!!
                service.lists = data;
            });
            return self;
        };

        Proteins.prototype.create = function (user, list) {
            var self = this;
            self.$promise = self.$dao.create({}, list).$promise;
            return self;
        };

        Proteins.prototype.update = function (user, list) {
            var self = this;
            self.$promise = self.$dao.update({id: list.id}, list).$promise;
            return self;
        };

        Proteins.prototype.delete = function (user, listId) {
            var self = this;
            self.$promise = self.$dao.delete({id: listId}).$promise;
            return self;
        };

        Proteins.prototype.getListByPublicId = function (listId) {
            return this.$daoLists.get({id: listId}).$promise;
        };

        /*
         Proteins.prototype.getByIds = function (user, list, cb) {
         var self = this;
         var params = {username: user.profile.username, id: list, action: 'ids'};
         //TODO remove cb
         self.$promise=self.$dao.get(params, function (result) {
         if (cb) cb(result);
         });
         return self;
         }
         */

        Proteins.prototype.combine = function (user, list, l1, l2, op) {
            var self = this;
            self.$promise = self.$dao.get({
                action: 'combine',
                username: user.profile.username,
                listname: list.name,
                description: list.description,
                listname1: l1,
                listname2: l2,
                op: op
            }).$promise;
            return self;
        };

        Proteins.prototype.addElements = function (user, listName, accs, cb) {
            var self = this;
            //TODO remove cb and user promise
            user.$promise.then(function () {
                return self.$dao.fix({
                    action: 'add',
                    username: user.profile.username,
                    list: listName
                }, JSON.stringify(accs), function (data) {
                    if (cb) cb(data);
                });
            });
            return this;
        };

        Proteins.prototype.removeElements = function (user, listName, accs, cb) {
            var self = this;
            //TODO remove cb and user promise
            return user.$promise.then(function () {
                return self.$dao.fix({
                    action: 'remove',
                    username: user.profile.username,
                    list: listName
                }, JSON.stringify(accs), function (data) {
                    if (cb) cb(data);
                });
            });
        };
        var service = new Proteins();
        return service;
    }

// implement the service
    uploadListService.$inject = ['config', '$q', '$http', '$rootScope', 'user', 'auth', 'ipCookie'];
    function uploadListService(config, $q, $http, $rootScope, user, auth, ipCookie) {

        $http.defaults.useXDomain = true;
        delete $http.defaults.headers.common["X-Requested-With"];

        var UploadList = function () {
        };
        UploadList.prototype.send = function (listId, file, cb) {
            var data = new FormData(),
                xhr = new XMLHttpRequest(),
                deferred = $q.defer(),
                url = config.api.API_URL + '/user/me/lists/:id/upload';

            // When the request starts.
            xhr.onloadstart = function () {
                $rootScope.$emit('upload:loadstart', xhr);
            };

            // When the request has failed.
            xhr.onerror = function (e) {
                $rootScope.$emit('upload:error', e);
                console.log('errrr', e);
                return deferred.reject(e, xhr)

            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status > 305) {
                    return deferred.reject(JSON.parse(xhr.responseText))
                }
                if (xhr.readyState === 4 && xhr.status === 200) {
                    return deferred.resolve(xhr)
                }
            };

            // Send to server, where we can then access it with $_FILES['file].
            data.append('file', file, file.name);
            xhr.open('POST', url.replace(':id', listId));

            //xhr.setRequestHeader('Authorization','Bearer ' + auth.idToken);
            xhr.setRequestHeader('Authorization', 'Bearer ' + ipCookie('nxtoken'));

            xhr.send(data);
            return deferred.promise;
        };
        return new UploadList();
    }


})(angular);

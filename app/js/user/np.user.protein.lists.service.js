(function (angular, undefined) {
    'use strict';

// create the module and define one service
    angular.module('np.user.protein.lists.service', [])
        .factory('userProteinList', userProteinList)
        .factory('uploadListService', uploadListService);


//
// implement the service
    userProteinList.$inject = ['$resource', 'config','$q'];
    function userProteinList($resource, config, $q) {

        var Proteins = function () {

            this.$dao = $resource(config.api.API_URL + '/user/:username/protein-list/:id/:action',
                {username: '@username', id: '@id', action: '@action'}, {
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

        Proteins.prototype.list = function (user, cb) {
            var self = this;
            self.$promise=self.$dao.list({username: user.profile.username}).$promise;
            self.$promise.then(function (data) {
                service.lists = data;
            });                
            return self;
        };

        Proteins.prototype.create = function (user, list) {
            var self = this;
            self.$promise=self.$dao.create({username: user.username}, list).$promise;
            return self;
        };

        Proteins.prototype.update = function (user, list) {
            var self = this;
            self.$promise=self.$dao.update({username: user.profile.username, id: list.id}, list).$promise;
            return self;
        };

        Proteins.prototype.delete = function (user, listId) {
            var self = this;
            self.$promise=self.$dao.delete({username: user.profile.username, id: listId}).$promise;
            return self;
        }


        Proteins.prototype.getByIds = function (user, list, cb) {
            var self = this;
            var params = {username: user.profile.username, id: list, action: 'ids'};
            //TODO remove cb
            self.$promise=self.$dao.get(params, function (result) {
                if (cb) cb(result);
            });
            return self;
        }


        Proteins.prototype.combine = function (user, list, l1, l2, op) {
            var self = this;
            self.$promise=self.$dao.get({
                action: 'combine',
                username: user.profile.username,
                listname: list.name,
                description: list.description,
                listname1: l1,
                listname2: l2,
                op: op
            }).$promise;
            return self;
        }

        Proteins.prototype.addElements = function (user, listName, accs, cb) {
            var self = this;
            //TODO remove cb and user promise
            user.$promise.then(function () {
                return self.$dao.fix({
                    action: 'add',
                    username: user.profile.username,
                    list: listName,
                }, JSON.stringify(accs), function (data) {
                    if (cb) cb(data);
                });
            })
            return this;
        }

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
            })
            return this;
        }
        var service = new Proteins();
        return service;
    }


//
// implement the service
    uploadListService.$inject = ['config', '$q','$http', '$rootScope','user','auth'];
    function uploadListService(config, $q, $http, $rootScope,user,auth) {
        var _files = [];

        $http.defaults.useXDomain = true;
        delete $http.defaults.headers.common["X-Requested-With"]

        var UploadList = function () {
        }
        UploadList.prototype.send = function (listId, file, cb) {
            var data = new FormData(),
                xhr = new XMLHttpRequest(),
                deferred=$q.defer(),
	          url=config.api.API_URL + '/user/:username/protein-list/:id/upload'
        	 			.replace(':username',user.profile.username);


            // When the request starts.
            xhr.onloadstart = function () {
                $rootScope.$emit('upload:loadstart', xhr);
            };

            // When the request has failed.
            xhr.onerror = function (e) {
                $rootScope.$emit('upload:error', e);
                console.log('errrr',e)
                return deferred.reject(e,xhr)            		

            };

            xhr.onreadystatechange=function(){
            	if(xhr.readyState==4 && xhr.status>305){
            		return deferred.reject(JSON.parse(xhr.responseText))            		
            	}
            	if(xhr.readyState===4 &&  xhr.status===200){
            		return deferred.resolve(xhr)            		
            	}
            }

            // Send to server, where we can then access it with $_FILES['file].
            data.append('file', file, file.name);
            xhr.open('POST', url.replace(':id',listId));
            xhr.setRequestHeader('Authorization','Bearer ' + auth.idToken)
            xhr.send(data);
            return deferred.promise;
        }
        return new UploadList();
    }


})(angular);

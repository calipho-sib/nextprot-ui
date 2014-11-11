(function (angular, undefined) {'use strict';

angular.module('np.user.query.service', [])

.run(['$resource','config','user',function($resource,config,user){

    var UserQuery = function () {
        //  this.selectedQuery = {};
        this.queries = {};
        this.$dao={
            queries:$resource(config.baseUrl+'/nextprot-api-web/user/:username/query/:id',
                {username: '@username', id: '@id'}, {
                    get: { method: 'GET', isArray: false },
                    create: { method: 'POST' },
                    update: { method: 'PUT'}
                })
        }
    };

    UserQuery.prototype.list = function () {

        var me = this, params={};

        me.$promise=me.$dao.userQuery.query(params)
        me.$promise.then(function(data){
            console.log('-------------',data)
            me.queries=data;
        })
        return me;
    };

    UserQuery.prototype.createAdvancedQuery = function (username, cb, cbe) {
        $user_query_list.create({ username: UserService.userProfile.username }, this.selectedQuery, function (data) {
            if (cb)cb(data);
        }, function (error) {
            if (cbe)cbe(error);
        });
    };

    UserQuery.prototype.updateAdvancedQuery = function (username, cb, cbe) {
        $api_adv_query_id.update({ username: UserService.userProfile.username, id: this.selectedQuery.userQueryId }, this.selectedQuery, function (data) {
            if (cb)cb(data);
        }, function (error) {
            if (cbe)cbe(error);
        });
    };

    UserQuery.prototype.deleteAdvancedQuery = function (aq, cb) {
        var me = this;
        if (confirm("Are you sure you want to delete the selected query?")) {
            $api_adv_query_id.delete({ username: UserService.userProfile.username, id: aq.userQueryId}, function (data) {
                flash('alert-success', aq.title + " query deleted successfully for ");
                me.getRepository(Search.config.widgets.repositories.privateRep);
                if (cb)cb(data);
            });
        }
    };


    UserQuery.prototype.setCurrentQuery = function (query) {

        console.log(query);
        //The binding is done at the level of the primitive, therefore
        angular.extend(this.selectedQuery, query);

    };

    UserQuery.prototype.isSelectedQueryEmpty = function () {
        return ((typeof this.selectedQuery.username === 'undefined') ||
            (this.selectedQuery.username == null) ||
            (this.selectedQuery.username == ""));
    };

    UserQuery.prototype.clearSelectedQuery = function () {
        this.selectedQuery = {};
    };

    UserQuery.prototype.isSelectedQueryEditable = function () {
        return (UserService.userProfile.username == this.selectedQuery.username);
    };

    UserQuery.prototype.isNew = function () {
        return (this.selectedQuery.userQueryId == null);
    };

    UserQuery.prototype.insertOrUpdateSelectedQuery = function () {
        var me = this;
        if (this.isNew()) {
            this.createAdvancedQuery(user.profile.username,
                function (data) {
                    flash('alert-success', ' query saved successfully!')
                    me.selectedQuery = {};
                    me.getRepository(Search.config.widgets.repositories.privateRep);
                    return;
                },
                function (error) {
                    if (error.status == 409) {
                        flash('alert-warn', 'object already exists, choose a different name.')
                    }
                }
            );
        } else {
            this.updateAdvancedQuery(user.profile.username,
                function (data) {
                    flash('alert-success', "Updated successful for " + data.title);
                    me.selectedQuery = {};
                    me.getRepository(Search.config.widgets.repositories.privateRep);
                    return;
                },
                function (error) {
                    if (error.status == 409) {
                        flash('alert-warn', 'object already exists, choose a different name.')
                    }
                }
            );
        }
    }


    UserQuery.prototype.createNewEmptyQuery = function (cb) {
        this.selectedQuery.title = null;
        this.selectedQuery.published = false;
        this.selectedQuery.username = user.profile.username;
        this.selectedQuery.sparql = "#Write your sparql query here";
        this.selectedQuery.description = null;
    }


    user.query=new UserQuery();

 }])

.factory('queryRepository', [
   '$resource','config','user', function($resource, config, user) {
       var baseUrl = config.api.BASE_URL + config.api.API_PORT;

       var QueryRepository = function () {
           //  this.selectedQuery = {};
           this.queries = {};
           this.$dao={
               queries:$resource('https://api.nextprot.org/user/advanced-nextprot-query.json',
                    {username: '@username', id: '@id'}, {
                       list: { method: 'GET', isArray: true }
                   })
           }
       };


       QueryRepository.prototype.list = function () {
           return this.$dao.queries.list();
       }

       return new QueryRepository();
   }


])

.controller('QueryRepositoryCtrl', [
    '$scope', 'config','user', function($scope, config, user) {

        $scope.showRepository = false;

        $scope.toggleRepository = function() {
            $scope.showRepository = !$scope.showRepository;
        }

    }
]);


})(angular); //global variable

(function (angular, undefined) {'use strict';

angular.module('np.user.query.service', [])

.factory('UserQuery', [
    '$resource','config','user','$q',function($resource,config,user,$q){
    var $dao={
        queries:$resource(config.baseUrl+'/nextprot-api-web/user/:username/query/:id',
            {username: '@username', id: '@id'}, {
                get: { method: 'GET', isArray: false },
                create: { method: 'POST' },
                update: { method: 'PUT'}
            })
    }

    //
    // model for user sparql queries
    var UserQuery = function (data) {
        this.queries = {};
        this.$dao=$dao;

        // init this instance
        this.id         = data&&data.id||undefined;
        this.title      = data&&data.title||'';
        this.published  = data&&data.published||false;
        this.username   = data&&data.username||user.profile.username;
        this.sparql     = data&&data.sparql||"#Write your sparql query here";
        this.description= data&&data.description||'';
        this.isEditable = (this.username===user.profile.username);

        //
        // wrap promise to this object
        this.$promise=$q.when(this)            

    };

    //
    // create an empty query for this user
    UserQuery.prototype.createEmpty=function(){
        return new UserQuery();
    }    

    // CRUD operations
    // list queries for this user
    UserQuery.prototype.list = function () {

        var me = this, params={username:user.profile.username};
        me.$promise=me.$dao.queries.query(params)
        me.$promise.then(function(data){
            // TODO instance of query should be UserQuery class
            // TODO UserQueryRepository should maintain local store?
            // me.getRepository(Search.config.widgets.repositories.privateRep);
            me.queries=data;
        })
        return me;
    };

    //
    // save or create the current instance
    UserQuery.prototype.save = function () {
        var me = this, params={username:this.username};
        // on update
        if(this.id){
            params.id=this.id;
            me.$promise=me.$dao.queries.update(params,me)
        }else{
            me.$promise=me.$dao.queries.create(params,me)    
        }
        
        // TODO me.$promise.then
        // me.getRepository(Search.config.widgets.repositories.privateRep);
        return me;
    };

    //
    // delete the current instance
    UserQuery.prototype.delete = function () {
        var me = this, params={username:this.username};
        me.$promise=me.$dao.queries.delete(params,me)
        // TODO me.$promise.then
        // me.getRepository(Search.config.widgets.repositories.privateRep);
        return me;
    };





    // UserQuery.prototype.insertOrUpdateSelectedQuery = function () {
    //     var me = this;
    //     if (this.isNew()) {
    //         this.createAdvancedQuery(user.profile.username,
    //             function (data) {
    //                 flash('alert-success', ' query saved successfully!')
    //                 me.selectedQuery = {};
    //                 me.getRepository(Search.config.widgets.repositories.privateRep);
    //                 return;
    //             },
    //             function (error) {
    //                 if (error.status == 409) {
    //                     flash('alert-warn', 'object already exists, choose a different name.')
    //                 }
    //             }
    //         );
    //     } else {
    //         this.updateAdvancedQuery(user.profile.username,
    //             function (data) {
    //                 flash('alert-success', "Updated successful for " + data.title);
    //                 me.selectedQuery = {};
    //                 me.getRepository(Search.config.widgets.repositories.privateRep);
    //                 return;
    //             },
    //             function (error) {
    //                 if (error.status == 409) {
    //                     flash('alert-warn', 'object already exists, choose a different name.')
    //                 }
    //             }
    //         );
    //     }
    // }


    user.query=new UserQuery();

    return UserQuery;
 }])

.factory('queryRepository', [
   '$resource','config','user','$q', function($resource, config, user, $q) {
       var baseUrl = config.api.BASE_URL + config.api.API_PORT;


       var description={
        'public':'This is the public repository',
        'private':'This is the private repository',
        'nextprot':'This is the nextprot repository'
       }

       var icons={
        'public':'icon-globe',
        'private':'icon-user',
        'nextprot':'icon-certificate'
       }

       var QueryRepository = function () {
           //  this.selectedQuery = {};
           this.category='public';

           this.queries = {};
           this.$dao={
               queries:$resource('https://api.nextprot.org/user/advanced-nextprot-query.json',
                    {username: '@username', id: '@id'}, {
                       list: { method: 'GET', isArray: false }
                   })
           }

            //
            // wrap promise to this object
            this.$promise=$q.when(this)            

       };

       //
       // return
       QueryRepository.prototype.setCategory=function(name){
            return this.category=name;
       }       

       QueryRepository.prototype.getDescription=function(name){
            return description[this.category];
       }       

       QueryRepository.prototype.getIcon=function(name){
            return icons[this.category];
       }       

       QueryRepository.prototype.list = function () {
            var me=this;
           this.$promise=this.$dao.queries.list().$promise;
           this.$promise.then(function(data){
             me.queries=data.userQueryList.map(function(q){return new UserQuery(q)})
           })
           return this
       }

       return new QueryRepository();
   }


])

.controller('QueryRepositoryCtrl', [
    '$scope', 'config','user','queryRepository', function($scope, config, user, queryRepository) {

        // publish data
        $scope.repository={
            show:false,
            queries:[],
            selectedQuery:false
        };
        $scope.queryRepository=queryRepository;

        // publish function
        $scope.toggleRepository = function() {
            $scope.repository.show = !$scope.repository.show;

            //
            // needs to load queries
            if($scope.repository.show && !$scope.repository.queries.length){
                $scope.loadQueries();
            }
        }

        $scope.loadQueries=function(){
            queryRepository.list().$promise.then(function(){
                $scope.repository.queries=queryRepository.queries
            })
        }

        $scope.setCurrentQuery=function(query){
            $scope.repository.selectedQuery=query;
        }

        $scope.createNewEmptyQuery=function(){            
            $scope.repository.selectedQuery=user.queries.createEmpty();
        }

        $scope.saveSelectedQuery=function(){
            $scope.repository.selectedQuery.save();
        }

        $scope.deleteSelectedQuery=function(){
            if (confirm("Are you sure you want to delete the selected query?")) {
            }
        }

        $scope.clearSelectedQuery=function(){
            $scope.repository.selectedQuery=false;
        }

    }
]);


})(angular); //global variable

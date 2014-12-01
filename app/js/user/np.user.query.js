(function (angular, undefined) {'use strict';

var q=angular.module('np.user.query.service', [])
    .factory('queryRepository',queryRepository)
    .controller('QueryRepositoryCtrl', QueryRepositoryCtrl)
    .run(initQueryModule);


  //
  // init module
  initQueryModule.$inject=['$resource','config','user','$q','$cacheFactory'];
  function initQueryModule($resource,config,user,$q,$cacheFactory){
      //
      // data access
      var $dao={
          queries:$resource(config.baseUrl+'/nextprot-api-web/user/:username/query/:id',
              {username: '@username', id: '@id'}, {
                  get: { method: 'GET', isArray: false },
                  create: { method: 'POST' },
                  update: { method: 'PUT'}
              })
      }

      //
      // repository of queries (TODO more cache access)
      var queryList=$cacheFactory('queries')



      //
      // model for user sparql queries
      var Query = function (data) {

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

          // save this instance
          queryList.put(this.id,this)
      };


      //
      // create a new query for this user
      Query.prototype.createOne=function(init){
          return new Query(init);
      }    

      //
      // check is this query is owned by the current user
      Query.prototype.isOwner=Query.prototype.isEditable=function(){
          return (this.username === user.profile.username);
      }    


      //
      // CRUD operations
      //

      //
      // list queries for this user
      Query.prototype.list = function () {

          var me = this, params={username:user.profile.username};
          me.$promise=$dao.queries.query(params)
          me.$promise.then(function(data){
              // TODO instance of query should be Query class
              // TODO QueryRepository should maintain local store?
              // me.getRepository(Search.config.widgets.repositories.privateRep);
              me.queries=data;
          })
          return me;
      };

      //
      // save or create the current instance
      Query.prototype.save = function () {
          var me = this, params={username:this.username};
          // on update
          if(this.id){
              params.id=this.id;
              me.$promise=$dao.queries.update(params,me)
          }else{
              me.$promise=$dao.queries.create(params,me)    
          }
          
          // TODO me.$promise.then
          // me.getRepository(Search.config.widgets.repositories.privateRep);
          return me;
      };

      //
      // delete the current instance
      Query.prototype.delete = function () {
          var me = this, params={username:this.username};
          me.$promise=$dao.queries.delete(params,me)
          // TODO me.$promise.then
          // me.getRepository(Search.config.widgets.repositories.privateRep);
          return me;
      };

      user.query=new Query();

      return Query;

  }

//
// 
queryRepository.$inject=['$resource','config','user','$q'];
function queryRepository($resource, config, user, $q) {
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
         me.queries=data.userQueryList.map(function(q){return user.query.createOne(q)})
       })
       return this
   }

   return new QueryRepository();
}

//
//
QueryRepositoryCtrl.$inject=['$scope', 'config','user','queryRepository']
function QueryRepositoryCtrl($scope, config, user, queryRepository) {

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
        $scope.repository.selectedQuery=user.queries.createOne();
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


})(angular); //global variable

(function (angular) {
    'use strict';

    angular.module('np.content', [])
        .config(contentConfig)
        .controller('ContentCtrl', ContentCtrl)
        .service('contentURLResolver', contentURLResolver)
    ;

    contentConfig.$inject = ['$routeProvider'];
    function contentConfig($routeProvider) {

        $routeProvider
            .when('/news/', {title:'News', templateUrl: '/partials/doc/main-doc.html'})
            .when('/entries/', {title:'Chromosome entries', templateUrl: '/partials/doc/main-doc.html'})
            .when('/:section/:article', {title: 'help for nextprot', templateUrl: '/partials/doc/main-doc.html'})
    }


    ContentCtrl.$inject = ['$scope', '$routeParams', '$location', 'contentURLResolver', 'newsService', 'chromosomeService'];
    function ContentCtrl($scope, $routeParams, $location, contentURLResolver, newsService, chromosomeService) {
        
        var releasePages = ["contents","statistics","protein-existence"];
        
        $scope.externalURL = null;      
        $scope.githubURL = null;
        $scope.simpleSearchText = "";
        $scope.title = "";
        $scope.minMenu = false;
        $scope.hideMenu = false;
        
        $scope.switchMenu = function(){
            $scope.hideMenu = !$scope.hideMenu;
        }
        
        $scope.minimizeMenu = function(){
            $scope.minMenu = !$scope.minMenu;
        }

        $scope.makeSimpleSearch = function (query) {
            $location.search("query", query);
            $location.path("proteins/search");
        }
        
        $scope.getSideMenuPartial = function(){

            var commonPath = "partials/doc/";
            if ($routeParams.section === "about") return commonPath + "about-side-bar.html";
            else if ($routeParams.section === "help") return commonPath + "help-side-bar.html";
            else if ($routeParams.section === "news") return commonPath + "news-side-bar.html";
            else if ($routeParams.section === "entries") return commonPath + "chromosome-entries-side-bar.html";
        }
        
        $scope.getContentPartial = function(){

            if ($routeParams.article === "protein-existence") return "partials/doc/iframe.html";
            else if (releasePages.indexOf($routeParams.article)>-1) return "partials/release_"+ $routeParams.article + ".html";
            else if ($routeParams.section === "news") return "partials/doc/news.html";
            else if ($routeParams.section === "entries") return "partials/doc/chromosome-entries.html";
            else if ($routeParams.section === "help" || $routeParams.article === "nextprot" ||
                $routeParams.article === "human-proteome" || $routeParams.article === "citing-nextprot" ||
                $routeParams.article === "functional-proteome-project" || $routeParams.article === "services" ) {
                return "partials/doc/page.html";
            }
        }

        $scope.activePage = function (page) {

            if($location.url() === page) return 'active';
            if ($routeParams.element === page)  return 'active';

            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {

            if (releasePages.indexOf($routeParams.article) > -1) { //Release view
                angular.extend($scope, contentURLResolver.getScopeParamsForRelease($routeParams.article));
            }
            else if ($routeParams.section === "news" || $location.path() === "/news/") { //News view
                if (!$routeParams.article){
                    console.log("no news article selected, redirecting to latest..");
                    var latest = newsService.getLatest();
                    if (!latest) {
                        newsService.getNews().$promise.then(function(news){
                            var latest = news[news.length-1].url;
                            $location.path("news/" + latest).replace();
                        });
                    }
                    else $location.path("news/" + latest).replace(); 
                }
                
                else angular.extend($scope, contentURLResolver.getScopeParamsForNews($routeParams.article));
            }
            else if ($routeParams.section === "entries" || $location.path() === "/entries/") {

                if (!$routeParams.article){
                    $location.path("entries/all-chromosomes").replace();
                }
                else {
                    angular.extend($scope, contentURLResolver.getScopeParamsForChromosomes($routeParams.article));
                }
            }
            else if ($routeParams.article) { //Help view
                angular.extend($scope, contentURLResolver.getScopeParamsForContent($routeParams.section,$routeParams.article));
            }
        });
    }

    contentURLResolver.$inject = ['$sce', '$location', 'config', 'npSettings'];
    function contentURLResolver($sce, $location, config, npSettings) {


        //Setting correct api for viewer
        var env = npSettings.environment;
        // Choose the environemnt for the viewers
//        if(env.indexOf("NX_") !== -1){ 
//            env = 'dev';
//        }

        function concatEnvToUrl (url) {
            var envUrl = "";
            if(env !== 'pro'){
                if(url.indexOf('?') !== -1){
                    envUrl = ("&env=" + env);
                }else {
                    envUrl = ("?env=" + env);
                }
            }
            return url + envUrl;
        }

        this.getScopeParamsForContent = function (section,article) {

            var url = window.location.origin + "/" + section + "/" + article;
            
//            url += "/app/index.html";

            return {
                "communityMode": false,
//                TO FIX
                "githubURL": "https://github.com/calipho-sib/" + article,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "title": article,
                "section": section.toUpperCase()
            }

        }
        this.getScopeParamsForNews = function (n1) {

            var url = window.location.origin + "/news/" + n1;

            return {
                "communityMode": false,
                "githubURL": "https://github.com/calipho-sib/" + n1,
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
                "linkToParent":"about/nextprot",
                "parent": "ABOUT",
                "title": "NEWS",
                "section": "NEWS",
                "type":"news",
                "h1":n1
            }

        }
        this.getScopeParamsForRelease = function (release) {

            var url = window.location.origin + "/release/" + release;
            var pe = (release === "protein-existence");
            var chromosome;
            if (pe){
                chromosome = new URLSearchParams(window.location.search).get("chromosome");
                url = window.location.origin + "/viewers/" + "statistics/protein-existence/app/index.html";
                if(chromosome) {
                    if(chromosome == 'x' || chromosome == 'y') {
                        chromosome = chromosome.toUpperCase();
                    }
                    url = url + "?chromosome=" + chromosome
                }
            }
            
            var urlWithTitle = pe ? url + "?title=true" : url;
            
//            url += "/app/index.html";

            return {
                "communityMode": false,
//                TO FIX
                "githubURL": pe ? "https://github.com/calipho-sib/nextprot-viewers/blob/master/statistics/protein-existence/app/" : "",
                "externalURL": $sce.trustAsResourceUrl(concatEnvToUrl(urlWithTitle)),
                "widgetURL": $sce.trustAsResourceUrl(concatEnvToUrl(url)),
//                "linkToParent":"about/about",
//                "parent": "ABOUT",
                "title": "RELEASE",
                "section": "ABOUT",
//                "h1":release
            }

        }
        this.getScopeParamsForChromosomes = function (chromosome) {

            return {
                "chromosome":chromosome,
                "parent": "ABOUT",
                "linkToParent":"about/nextprot",
                "title": "ENTRIES",
                "section": "ENTRIES",
                "h1":chromosome
            }

        };
    }


    })(angular); //global variable
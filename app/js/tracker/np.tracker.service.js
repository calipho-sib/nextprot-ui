'use strict';

var TrackingService = angular.module('np.tracker', []);

TrackingService.factory('Tracker', [
    '$window',
    '$location',
    '$routeParams',
    function ($window, $location, $routeParams) {

        var separator = '_';

        var tracker = {};

        tracker.trackPageView = function () {
            $window.ga('send', 'pageview', $location.url());
        };

        tracker.trackTransitionRouteChangeEvent = function(dest) {

            var gaEvent = {
                'hitType': 'event',
                'eventCategory': 'ui'+separator+'routing-'+dest
            };
            console.log("tracking route -> ga event:", gaEvent);

            if (Object.keys(gaEvent).length>0) {
                ga('send', gaEvent);
            }
        };

        tracker.trackDownloadEvent = function (type, selectedFormat, selectedView) {
            var gaEvent = {
                'hitType': 'event',
                'eventCategory': 'ui'+separator+'download'
            };

            gaEvent.eventAction = gaEvent.eventCategory + separator +((type != null) ? 'entries':'entry');
            gaEvent.eventLabel = gaEvent.eventAction + separator + selectedView+"-"+selectedFormat;

            console.log("tracking download event -> ga event:", gaEvent);
            ga('send', gaEvent);
        };

        tracker.trackSaveAsListEvent = function (count, hasSucceed) {
            var gaEvent = {
                'hitType': 'event',
                'eventCategory': 'ui'+separator+'save-as-list'
            };

            gaEvent.eventAction = gaEvent.eventCategory+separator+'size-'+count;
            gaEvent.eventLabel = gaEvent.eventAction+separator+((hasSucceed)?'success':'failure');

            console.log("tracking download event -> ga event:", gaEvent);
            ga('send', gaEvent);
        };

        tracker.trackRouteChangeEvent = function() {

            var factory = {};

            if ("query" in $routeParams) {
                factory = new SimpleSearchRouteEventFactory($routeParams.entity, $routeParams.query, $routeParams.filter, $routeParams.quality);
            }
            else if ("sparql" in $routeParams) {
                factory = new AdvancedSparqlSearchRouteEventFactory($routeParams.filter);
            }
            else if ("queryId" in $routeParams) {

                var queryId = $routeParams.queryId;
                var type;

                // predefined query
                if (queryId.startsWith("NXQ_")) {
                    type = 'NXQ';
                    queryId = queryId.split("_")[1];
                }
                // private query
                else
                    type = 'query';

                factory = new AdvancedQueryIdSearchRouteEventFactory(type, queryId, $routeParams.filter);
            }
            else if ("listId" in $routeParams) {
                factory = new ListSearchRouteEventFactory($routeParams.filter);
            }
            else if ("article" in $routeParams) {
                factory = new HelpRouteEventFactory($routeParams.article);
            }

            if (Object.keys(factory).length > 0) {

                var event = factory.create();

                console.log("$location:", $location, ", $routeParams:", $routeParams, "event:", event);

                ga('send', event);
            }
        };

        function gaEvent(category, action, label) {

            var event = {
                'hitType': 'event',
                'eventCategory': category,
                'eventAction': action
            };

            if (typeof label !== 'undefined')
                event.eventLabel = label;

            return event;
        }

        function RouteEventFactory(funcCategory, funcAction, funcLabel) {

            var factory = {};

            factory.category = function () {

                return 'ui' + separator + funcCategory()
            };

            factory.action = function () {

                return 'ui' + separator + funcAction()
            };

            if (typeof funcLabel !== 'undefined') {

                factory.label = function () {

                    return 'ui' + separator + funcLabel()
                };
            }

            factory.create = function () {

                if ('label' in this)
                    return new gaEvent(this.category(), this.action(), this.label());
                else
                    return new gaEvent(this.category(), this.action());
            };

            return factory;
        }

        function SearchRouteEventFactory(kind, type, filter) {

            function category() {
                return 'search' + separator + kind;
            }

            function action() {
                var action = category() + separator + type;

                if (typeof filter !== 'undefined')
                    action += separator + "filtered";

                return action;
            }

            return new RouteEventFactory(category, action);
        }

        function SimpleSearchRouteEventFactory(type, query, filter, silverPlus) {

            var factory = new SearchRouteEventFactory('simple', type, filter);

            var parentAction = factory.action();

            factory.action = function () {

                var action = parentAction;

                if (typeof silverPlus !== 'undefined')
                    action += separator + "gold-and-silver";

                return action;
            }

            factory.label = function () {

                return factory.action() + separator + query;
            };

            return factory;
        }

        function AdvancedSparqlSearchRouteEventFactory(filter) {

            return new SearchRouteEventFactory('advanced', 'sparql', filter);
        }

        function AdvancedQueryIdSearchRouteEventFactory(type, queryId, filter) {

            var factory = new SearchRouteEventFactory('advanced', type, filter);

            if (typeof queryId !== 'undefined' && type == 'NXQ') {

                factory.label = function () {

                    return factory.action() + separator + queryId;
                };
            }
            return factory;
        }

        function ListSearchRouteEventFactory(filter) {

            function category() {
                return 'search' + separator + 'list';
            }

            function action() {
                var action = category();

                if (typeof filter !== 'undefined')
                    action += separator + "filtered";

                return action;
            }

            var factory = new RouteEventFactory(category, action);

            if (typeof filter !== 'undefined') {
                factory.label = function () {

                    return factory.action() + separator + filter;
                };
            }

            return factory;
        }

        function HelpRouteEventFactory(docname) {

            function category() {
                return 'help';
            }

            function action() {
                return category() + separator + docname;
            }

            return new RouteEventFactory(category, action);
        }

        // The ga() function provides a single access point for everything in the analytics.js library
        // all tracking calls are made via the ga() function
        function createAndInitGATracker(propertyId) {

            // Google Analytics
            // Asynchronously loads the analytics.js library onto this page
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            // Creates a new default tracker object
            ga('create', propertyId, 'auto');
        }

        // Setup Universal Analytics Web Tracking (analytics.js)
        createAndInitGATracker('UA-61448300-1');

        // Sends a first pageview hit for the current page to Google Analytics
        ga('send', 'pageview');

        return tracker;
    }]);


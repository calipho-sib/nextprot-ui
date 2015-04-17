'use strict';

var TrackingService = angular.module('np.tracker', []);

TrackingService.factory('Tracker', [
    '$window',
    '$location',
    '$routeParams',
    function ($window, $location, $routeParams) {

        var tracker = {};

        tracker.trackPageView = function () {
            $window.ga('send', 'pageview', $location.url());
        };

        tracker.trackTransitionRouteChangeEvent = function(dest) {

            var gaEvent = {
                'hitType': 'event',
                'eventCategory': 'ui_routing-'+dest
            };
            console.log("tracking route -> ga event:", gaEvent);

            if (Object.keys(gaEvent).length>0) {
                ga('send', gaEvent);
            }
        };

        tracker.trackDownloadEvent = function (type, selectedFormat, selectedView) {
            var gaEvent = {
                'hitType': 'event',
                'eventCategory': 'ui_download'
            };

            gaEvent.eventAction = gaEvent.eventCategory+"_"+((type != null) ? 'entries':'entry');
            gaEvent.eventLabel = gaEvent.eventAction + "_" + selectedView+"-"+selectedFormat;

            console.log("tracking download event -> ga event:", gaEvent);
            ga('send', gaEvent);
        };

        tracker.trackSaveAsListEvent = function (count, hasSucceed) {
            var gaEvent = {
                'hitType': 'event',
                'eventCategory': 'ui_save-as-list'
            };

            gaEvent.eventAction = gaEvent.eventCategory+"_size-"+count;
            gaEvent.eventLabel = gaEvent.eventAction+"_"+((hasSucceed)?'success':'failure');

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

            var delimitor = '_';

            var factory = {};

            factory.category = function () {

                return 'ui' + delimitor + funcCategory()
            };

            factory.action = function () {

                return 'ui' + delimitor + funcAction()
            };

            if (typeof funcLabel !== 'undefined') {

                factory.label = function () {

                    return 'ui' + delimitor + funcLabel()
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

            var delimitor = '_';

            function category() {
                return 'search' + delimitor + kind;
            }

            function action() {
                var action = category() + delimitor + type;

                if (typeof filter !== 'undefined')
                    action += delimitor + "filtered";

                return action;
            }

            return new RouteEventFactory(category, action);
        }

        function SimpleSearchRouteEventFactory(type, query, filter, silverPlus) {

            var delimitor = '_';

            var factory = new SearchRouteEventFactory('simple', type, filter);

            var parentAction = factory.action();

            factory.action = function () {

                var action = parentAction;

                if (typeof silverPlus !== 'undefined')
                    action += delimitor + "gold-and-silver";

                return action;
            }

            factory.label = function () {

                return factory.action() + delimitor + query;
            };

            return factory;
        }

        function AdvancedSparqlSearchRouteEventFactory(filter) {

            return new SearchRouteEventFactory('advanced', 'sparql', filter);
        }

        function AdvancedQueryIdSearchRouteEventFactory(type, queryId, filter) {

            var delimitor = '_';

            var factory = new SearchRouteEventFactory('advanced', type, filter);

            if (typeof queryId !== 'undefined' && type == 'NXQ') {

                factory.label = function () {

                    return factory.action() + delimitor + queryId;
                };
            }
            return factory;
        }

        function ListSearchRouteEventFactory(filter) {

            var delimitor = '_';

            function category() {
                return 'search' + delimitor + 'list';
            }

            function action() {
                var action = category();

                if (typeof filter !== 'undefined')
                    action += delimitor + "filtered";

                return action;
            }

            var factory = new RouteEventFactory(category, action);

            if (typeof filter !== 'undefined') {
                factory.label = function () {

                    return factory.action() + delimitor + filter;
                };
            }

            return factory;
        }

        function HelpRouteEventFactory(docname) {

            var delimitor = '_';

            function category() {
                return 'help';
            }

            function action() {
                return category() + delimitor + docname;
            }

            return new RouteEventFactory(category, action);
        }

        return tracker;
    }]);


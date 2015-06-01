(function (angular, undefined) {
    'use strict';


    var SearchUI = angular.module('np.search.ui', []);


    SearchUI.filter('has', function () {
        return function (input, filter) {
            if (!input || !filter || !input.length || !filter.length)
                return false;
            return input.indexOf(filter) > -1;
        }
    });

    SearchUI.filter('showDropdown', function () {
        return function (input) {
            if (input == 'no')
                return 'hidden';
            return 'dropdown';
        }
    });

    SearchUI.filter('trim', function () {
        return function (input) {
            if (!input || !input.length)
                return '';
            return (input.trim());
        }
    });


    SearchUI.filter('getGitHubUrl', ['config', function (config) {

        return function (queryId) {

            var s = "000000000" + queryId;
            var fileName = "NXQ_" + s.substr(s.length - 5) + ".rq";
            return config.api.githubQueriesEdit + fileName;
        };

    }]);

    /**
     * Filters for publications
     */

    SearchUI.filter('getPubUrl', [function () {
        return function (ac) {
            if (ac.indexOf(":PubMed") != -1) {
                //return "http://www.ncbi.nlm.nih.gov/pubmed?term=" + ac.substring(ac, ac.indexOf(":"));
                return "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=pubmed&cmd=search&term=" + ac.substring(ac, ac.indexOf(":"));
            } else if (ac.indexOf(":DOI") != -1) {
                return "http://dx.doi.org/" + ac.substring(ac, ac.indexOf(":"));
            }
        }
    }]);

    SearchUI.filter('getPubSource', [function () {
        return function (ac) {
            if (ac.toLowerCase().indexOf("pubmed") != -1) return "PubMed";
            else return "Full text";
        };
    }]);

    SearchUI.filter('getPubId', [function () {
        return function (ac) {
            return ac.substring(0, ac.indexOf(":"));
        };
    }]);


    SearchUI.filter('getNeXtProtUrl', ['config', function (config) {
        return function (input) {

                if(config.api.environment === "pro"){
                 switch(input) {
                        case "api": return "https://api.nextprot.org" ;
                        case "search": return "https://search.nextprot.org" ;
                        case "snorql": return "http://snorql.nextprot.org" ;
                    }
                }

                if(input == "api") return config.api.API_URL;
                else return "http://"+ config.api.environment + "-" + input + ".nextprot.org";
        };
    }]);

    SearchUI.filter('filterMyQueries', ['user', function (user) {
        return function (items) {
            var filtered = [];
            angular.forEach(items, function (item) {
                if (item.owner === user.username) {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    }]);

    SearchUI.filter('containsTag', ['user',function (user) {
        return function(items, selectedTag) {
            var filtered = [];
            if(selectedTag == null)
                return items;

            if(selectedTag === 'My queries'){
                angular.forEach(items, function(item) {
                    if(item.owner === user.username) {
                        filtered.push(item);
                    }
                });
            }else {
                angular.forEach(items, function(item) {
                    if(_.intersection([selectedTag], item.tags).length > 0) {
                        filtered.push(item);
                    }
                });

            }

            return filtered;
        };
    }]);

    SearchUI.filter('encodeURIComponent', function() {
        return window.encodeURIComponent;
    });

    /*SearchUI.filter('limit', function () {
        return function (value, max, wordwise, tail) {
            if (!value) return '';
            if (!wordwise) wordwise = true;

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' ...');
        };
    });*/

    SearchUI.filter('prefix', function () {
        return function (value, max, wordwise) {
            if (!value) return '';
            if (!wordwise) wordwise = true;

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value;
        };
    });

    SearchUI.filter('suffix', function () {
        return function (value, max) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return '';

            var head = value.substr(0, max);
            var lastHeadSpace = head.lastIndexOf(' ');
            var tail;

            if (lastHeadSpace != -1) {
                tail = value.substr(lastHeadSpace+1);
            }

            return tail;
        };
    });

    SearchUI.directive('version', ['config', function (config) {
        return function (scope, elm, attrs) {
            elm.text(config.version);
        };
    }]);

    SearchUI.directive('npToggleAbstract', [function () {
        return function (scope, elm, attrs) {
            elm.click(function () {

                if (elm.context.text.match(/Show Abstract/)) {
                    elm.context.text = "Hide Abstract";
                } else if (elm.context.text.match(/Hide Abstract/)) {
                    elm.context.text = "Show Abstract";
                }
                angular.element(attrs.npToggleAbstract).toggleClass("hide")
            })
        };
    }]);

    SearchUI.directive('npToggleMore', [function () {
        return function (scope, elm, attrs) {
            elm.click(function () {

                if (elm.context.text.match(/more/)) {
                    elm.context.text = "[less]";
                } else if (elm.context.text.match(/less/)) {
                    elm.context.text = "[more]";
                }
                angular.element(attrs.npToggleMore).toggleClass("hide")
            })
        };
    }]);

    SearchUI.directive('npAnimate', ['config', 'Search', '$location', function (config, Search, $location) {
        return function (scope, elm, attrs) {
            var target = attrs.npAnimate;
            scope.$watch(function () {
                return $location.path()
            }, function (newValue, oldValue) {
                if (newValue !== "/" && newValue !== "/home") {
                    elm.addClass("animate");
                } else {
                    elm.removeClass("animate");
                }

            });
        };
    }]);


    SearchUI.directive('modalOnLoad', function () {
        return function (scope, element, attrs) {
            element.modal({backdrop: false});
        };
    });

    SearchUI.directive('npEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.npEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

//
// autocomplete with customized bootstrap typeahead
// https://github.com/twbs/bootstrap/blob/v2.3.2/js/bootstrap-typeahead.js
    SearchUI.directive('bsAutocomplete', ['Search', '$timeout', function (Search, $timeout) {
        var items = [];

        return function (scope, element, attrs) {
            var promise;

            element.typeahead({
                //minLength: 2,
                autoSelect: false,
                source: function (query, process) {

                    // cancel previous promise if defined
                    if (promise != undefined)
                        $timeout.cancel(promise);

                    // make a promise to look up suggestions after a time delay
                    if (this.$element.val().length>=2) {
                        promise = $timeout(function () {
                            Search.suggest(query, function (items) {
                                return process(items)
                            })
                        }, 500);
                    }
                },
                matcher: function (item) {
                    return true;
                },
                updater: function (item) {
                    Search.params.query = this.$element.val().replace(/[^ ]*$/, '') + item + ' '
                    scope.$emit('bs.autocomplete.update', {element: Search.params.query});
                    return Search.params.query;
                },
                highlighter: function (item) {
                    if (this.query.length > 0) {
                        // this.query: insulin rec
                        // items: receptor, recurrent, receptors, recruitment, receptormediated
                        var words = this.query.split(' ');
                        var endItem= item.slice(words[words.length - 1].length);
                        return "<span class='gray'>" + this.query + "</span><strong class='gray2'>" + endItem + "</strong>"
                    }
                    return this.query;
                }
            });
            // Bootstrap override
            var typeahead = element.data('typeahead');
            // Fixes #2043: allows minLength of zero to enable show all for typeahead
            typeahead.lookup = function (ev) {

                var items;
                this.query = this.$element.val() || '';

                if (this.query.length < this.options.minLength) {
                    return this.shown ? this.hide() : this;
                }
                items = this.source(this.query, $.proxy(this.process, this));

                return items ? this.process(items) : this;
            };
        };
    }]);

    SearchUI.directive('jqAutocomplete', ['Search', function (Search) {
        var results = [];
        return function (scope, elm, attrs) {
            elm.autocomplete({
                select: function (event, ui) {
                    var words = Search.params.query.split(/[\s,]+/);
                    words[words.length - 1] = ui.item.value;
                    Search.params.query = ui.item.value = words.join(' ');
                },
                minLength: 2,
                source: function (request, response) {
                    Search.solrSuggest(request.term, function (docs, solrParams) {
                        var facets = docs.facet_counts.facet_fields.text;
                        results = [];
                        for (var i = 0; i < facets.length; i = i + 2) {
                            results.push({"label": facets[i], "count": facets[i + 1], "value": facets[i]});
                        }
                        //console.log('solr',results,solrParams.q,solrParams )
                        return response(results)
                    });
                }
            })
        };
    }]);


    SearchUI.directive('slideOnClick', ['$parse', '$timeout', function ($parse, $timeout) {
        return function (scope, element, attr) {
            $timeout(function () {
                var e = angular.element(attr['slideOnClick']);
                if (e.length) {
                    element.toggle(function () {
                            e.slideDown();
                        },
                        function () {
                            e.slideUp();
                        })
                }
            }, 100);
        }
    }]);

    SearchUI.directive('npAffix', ['$parse', '$timeout', function ($parse, $timeout) {
        return function (scope, element, attr) {
            $timeout(function () {
                element.affix({offset: attr['npAffix']});
            }, 0);
        }
    }]);

    SearchUI.directive('indeterminateCheckbox', ['Search', function (Search) {
                return {
                    scope: true,
                    restrict: 'A',
                    link: function (scope, element, attrs) {

                        // Watch found proteins for changes
                        scope.$watch(attrs.foundProteinList, function (foundProteinList) {
                            var hasChecked = false;
                            var isIndeterminate = false;
                            var foundProteinCount = Search.resultCount;

                            // some proteins are selected
                            if (foundProteinList.length > 0) {
                                // some proteins are selected
                                hasChecked = true;

                                // not all proteins are selected -> indeterminate state
                                if (foundProteinList.length < foundProteinCount)
                                    isIndeterminate = true;
                            }

                            /*console.log("found proteins changed:", foundProteinList);
                            console.log("found count:", foundProteinCount);
                            console.log("has checked:", hasChecked, "is indeterminate:", isIndeterminate);*/

                            // Determine which state to put the checkbox in
                            if (hasChecked && isIndeterminate) {
                                element.prop('checked', false);
                                element.prop('indeterminate', true);
                            } else {
                                element.prop('checked', hasChecked);
                                element.prop('indeterminate', false);
                            }
                        }, true);
                    }
        }
    }]);

})(angular);



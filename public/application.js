'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies)
    .filter('trustedHtml', ['$sce', function ($sce) {
        return function (value) {
            return $sce.trustAsHtml(value);
        };
    }])
    .filter('vnd', function () {
        return function (value) {
            var c = 0,
                d = ',',
                t = '.';
            var n = value,
                c = isNaN(c = Math.abs(c)) ? 2 : c,
                d = d == undefined ? "." : d,
                t = t == undefined ? "," : t,
                s = n < 0 ? "-" : "",
                i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
                j;
                j = (j = i.length) > 3 ? j % 3 : 0;
            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        }})
    .filter('truncate', function () {
        return function (text, length, end) {
            text = text.replace(/(<([^>]+)>)/ig,"");
            if (isNaN(length))
                length = 10;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length - end.length) + end;
            }

        };
    }).directive('code', [function () {
        return {
            restrict: 'E',
            link: function ($scope, element, attrs) {
                element.ready(function () {
                    hljs.highlightBlock(element[0]);
                });
            }
        }
    }]).directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compile);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
        );
    };
}]);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.hashPrefix('!');
//        $locationProvider.html5Mode(true);
    }
]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

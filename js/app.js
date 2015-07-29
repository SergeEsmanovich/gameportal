'use strict';

/* App Module */

var Gportal = angular.module('Gportal', [
//    'ngMock',
    'ngRoute',
//    'phonecatAnimations',
    'gameControllers',
//    'kulinarFilters',
    'gameServices',
    'ngSanitize',
//    'ui.select',
    'ngAnimate',
    'infinite-scroll',
    'angular-inview',
    'textAngular',
    'ui.bootstrap'
//    'angularFileUpload'
]);

Gportal.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
                when('/home', {
                    templateUrl: 'partials/home.html',
                    controller: 'HomeCtrl'
                }).
                when('/news/:newsAlias', {
                    templateUrl: 'partials/news-detail.html',
                    controller: 'NewsCtrl'
                }).
               
                otherwise({
                    redirectTo: '/home'
                });
    }]);

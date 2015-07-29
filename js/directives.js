'use strict';

/* Directives */
gameControllers.directive('mymenu', function ($location, Content, $rootScope) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope, Content, $rootScope, $location) {
            $rootScope.Content = new Content();
            $scope.menu = [
                {id: 0, 'title': 'ALL NEWS', checked: 1, 'icon': 'fa-angle-down', image:'../images/all-cat.png'},
                {id: 8, 'title': 'ACTION', checked: 0, 'icon': 'fa-rocket', image:'../images/action.png'},
                {id: 9, 'title': 'INDIE', checked: 0, 'icon': 'fa-gamepad', image:'../images/indie.png'},
                {id: 11, 'title': 'MMO', checked: 0, 'icon': 'fa-users', image:'../images/mmo.png'},
                {id: 12, 'title': 'RACING', checked: 0, 'icon': 'fa-flag', image:'../images/racing.png'},
                {id: 13, 'title': 'RPG', checked: 0, 'icon': 'fa-gavel', image:'../images/rpg.png'},
                {id: 14, 'title': 'STRATEGY', checked: 0, 'icon': 'fa-shield', image:'../images/strategy.png'},
                {id: 15, 'title': 'SIMULATION', checked: 0, 'icon': 'fa-tachometer', image:'../images/simulation.png'},
                {id: 16, 'title': 'SPORTS', checked: 0, 'icon': 'fa-futbol-o', image:'../images/sports.png'},
            ];

            $scope.set_filtr = function (i) {
               if($location.path().indexOf('home') == -1){
//                    $scope.$apply(function () {
                        $location.path("/home");
//                    });
               }
                if (i != 0) {
                    //Выключаем первую категорию
                    $scope.menu[0].checked = 0;
                    //Добавляем категорию в фильтр если ее там нет, убираем если есть
                    var index = $rootScope.Content.filterM.indexOf($scope.menu[i].id);
                    if (index == -1) {
                        $rootScope.Content.filterM.push($scope.menu[i].id);
                    } else {
                        $rootScope.Content.filterM.splice(index, 1);
                    }
                    //Включаем или выключаем пункт меню
                    $scope.menu[i].checked = $scope.menu[i].checked != 1 ? 1 : 0;

                    //Фильтруем контент
                    $rootScope.Content.format_conteiner();
                } else {
                    //Если равен нулю значит чистим фильтр
                    $rootScope.Content.filterM = [];
                    //выключаем все пункты меню
                    angular.forEach($scope.menu, function (value, key) {
                        value.checked = 0;
                    });
                    //включаем 1-й пункт меню
                    $scope.menu[0].checked = 1;
                    //Фильтруем контент
                    $rootScope.Content.format_conteiner();
                }

            }
            $scope.get_active = function () {
                if ($scope.menu[0].checked)
                    return 'active';
            }
        },
        templateUrl: '/modules/menu.html'
    };
});


gameControllers.directive('social', function() {
        return {
            compile: function compile(templateElement, templateAttrs) {
                return function($scope,$rootScope) {
                    //$scope.test;
                    var  test = 'text';
                templateElement.html('<div class="share42init" data-title="'+$scope.test+'" data-description="'+$scope.test22+'" style="float:right;"></div><script type="text/javascript" src="http://inogamer/js/share42.js"></script>');                
           }

            },
            link: function (scope, element, attrs) {

            }
        }
    })
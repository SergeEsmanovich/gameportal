'use strict';

/* Controllers */
var gameControllers = angular.module('gameControllers', [], function ($httpProvider) {
    // Используем x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    // Переопределяем дефолтный transformRequest в $http-сервисе
    $httpProvider.defaults.transformRequest = [function (data) {
            /**
             * рабочая лошадка; преобразует объект в x-www-form-urlencoded строку.
             * @param {Object} obj
             * @return {String}
             */
            var param = function (obj) {
                var query = '';
                var name, value, fullSubName, subValue, innerObj, i;
                for (name in obj) {
                    value = obj[name];
                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
});

gameControllers.controller('HomeCtrl', ['$scope', '$http', 'Content', '$modal', '$log', '$location', '$rootScope',
    function ($scope, $http, Content, $modal, $log, $location, $rootScope) {

      //  $scope.Content = $rootScope.Content;

        $rootScope.$watch('Content', function (newValue, oldValue) {
            $scope.Content = newValue;
        });


        $scope.load_modal_content = function (material) {
            $rootScope.Content.open = material.id;
            $scope.modal = material;
        };
        $scope.test = function () {
            $('#myModal').modal('hide');
            $('#myModal').on('hidden.bs.modal', function (e) {
                $scope.$apply(function () {
                    $location.path("/news/" + $scope.modal.alias);
                });
            });
        }


        $scope.get_class = function (arr) {
            if (arr.length > 1) {
                return 'col-md-6 mini_block';
            } else {
                return 'col-md-12 big_block';
            }
        };





        $scope.sidebar = true;
        $scope.sidebar_show = function () {
            $scope.sidebar = $scope.sidebar === false ? true : false;
        };




    }]);


gameControllers.controller('NewsCtrl', ['$scope', '$http', 'Content', '$routeParams', '$modal', '$log',
    function ($scope, $http, Content, $routeParams, $modal, $log) {
        $scope.alias = $routeParams.newsAlias;
        $scope.Content = new Content();

        $scope.otherNews = [];

        $scope.comments = [];
        $scope.comment  = {};

        var $currentCategory;
        var $noteId;

        $scope.Content.find_material_by_alias($scope.alias, function(){
            $currentCategory = $scope.Content.material.catid;
            $noteId = $scope.Content.material.id;

            $scope.get_other();
            $scope.get_comments();
        });

        $scope.get_comments = function(){ 
            var url = '/joomla/index.php/?task=get_comments&option=com_gameportal&tmpl=component&format=row';

            $http.post(url, {noteId: $noteId}).
                success(function (data, status, headers, config) {
                    $scope.comments = data;
                }.bind(this)).
                error(function (data, status, headers, config) {
                    
            });
        }   

        $scope.get_other = function(){ 
            var url = '/joomla/index.php/?task=get_other&option=com_gameportal&tmpl=component&format=row';

            $http.post(url, {currentCategory: $currentCategory, noteId: $noteId}).
                success(function (data, status, headers, config) {
                    $scope.otherNews = data;
                }.bind(this)).
                error(function (data, status, headers, config) {
                    
            });
        }

        $scope.add_comment = function(){ 
            var url = '/joomla/index.php/?task=add_comment&option=com_gameportal&tmpl=component&format=row';

            $scope.comment.thread_id = $scope.Content.material.id;
            $scope.comment.username = 'runwell';
            $scope.comment.date = '';
            $scope.comment.published = true;

            $http.post(url, {comment: JSON.stringify($scope.comment)}).
                success(function (data, status, headers, config) {
                    $scope.comments.push(data); 
                }).
                error(function (data, status, headers, config) {   
            });

            $scope.comment = {};
        }     
    }
]);


gameControllers.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
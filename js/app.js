var Gportal = angular.module('gameportal', ['infinite-scroll', 'ngAnimate']);

Gportal.factory('Content', ['$rootScope', '$http',
    function ($rootScope, $http) {

        var link = 'http://joomla/index.php/?task=getcontent&option=com_gameportal&tmpl=component&format=row&page=';

        var service = {};
        service.page = 1;

        service.data = {};
        service.loadcontent = function () {

            $http({method: 'GET', url: link + service.page})
                    .success(function (data, status, headers, config) {
                        service.data.content = data;
                        service.data.conteiner = service.get_content(data);
                    })
                    .error(function (data, status, headers, config) {
                        console.log(headers);
                    });
            return  service.data;
        }
        service.loadmore = function (filterM) {
            service.page += 10;
            $http({method: 'GET', url: link + service.page})
                    .success(function (data, status, headers, config) {
                        //  service.data.content.push(data);
                        service.data.content = service.data.content.concat(data);
                        service.data.conteiner = service.get_content(service.data.content);
                       // console.log(data.length);
                       if(data.length==0)
                        service.data.end = 1;
                        // service.data.conteiner = service.get_conteiner(filterM);
                    })
                    .error(function (data, status, headers, config) {
                        console.log(headers);
                    });
           // return  service.data;
        }

        service.get_content = function (content) {
            var arr_small = [];
            var arr_big = [];
            var conteiner = [];
            angular.forEach(content, function (value, key) {
                if (key % 7 != 0) {
                    arr_small.push(value);
                    if ((arr_small.length == 2) || (key + 1 == content.length)) {
                        conteiner.push({block: arr_small});
                        arr_small = [];
                    }
                } else {
                    arr_big.push(value);
                    conteiner.push({block: arr_big});
                    arr_big = [];
                }
            });
            return  conteiner;
        }

        service.get_conteiner = function (filterM) {
            var content = [];
            filterM = typeof filterM !== 'undefined' ? filterM : [];


            angular.forEach(service.data.content, function (value, key) {
                if (filterM.indexOf(value.catid) !== -1) {
                    content.push(value);
                }

            });

            if (filterM.length > 0) {
                service.data.conteiner = service.get_content(content);
            }
            else {
                service.data.conteiner = service.get_content(service.data.content);
            }
            return service.data;
        }






        return service;
    }]);



Gportal.controller('HomeCtrl', function ($scope, $http, Content) {
    $scope.filterM = [];

    $scope.menu = [
        {id: 0, 'title': 'Все новости', checked: 1, 'icon': 'fa-angle-down'},
        {id: 8, 'title': 'Политика', checked: 0, 'icon': 'fa-user'},
        {id: 9, 'title': 'Экономика и бизнес', checked: 0, 'icon': 'fa-bar-chart'},
        {id: 11, 'title': 'Финансы', checked: 0, 'icon': 'fa-university'},
        {id: 12, 'title': 'Общество', checked: 0, 'icon': 'fa-users'},
        {id: 13, 'title': 'В мире', checked: 0, 'icon': 'fa-globe'},
        {id: 14, 'title': 'Спорт', checked: 0, 'icon': 'fa-futbol-o'},
        {id: 15, 'title': 'Культура', checked: 0, 'icon': 'fa-leanpub'},
        {id: 16, 'title': 'Авто', checked: 0, 'icon': 'fa-car'},
        {id: 17, 'title': 'Происшествия', checked: 0, 'icon': 'fa-fire'},
        {id: 18, 'title': 'Недвижимость', checked: 0, 'icon': 'fa-home'}
    ];



    $scope.data = Content.loadcontent();

    $scope.images = [1, 2, 3, 4, 5, 6, 7, 8];

    $scope.loadMore = function () {
       Content.loadmore($scope.filterM);
//        var last = $scope.images[$scope.images.length - 1];
//        for (var i = 1; i <= 8; i++) {
//            $scope.images.push(last + i);
//        }
    };


    $scope.get_class = function (arr) {
        if (arr.length > 1) {
            return 'col-md-6 mini_block';
        } else {
            return 'col-md-12 big_block';
        }
    };


    $scope.filteredContent = function () {
        if ($scope.data.conteiner)
            return $scope.data.conteiner.filter(function (objects) {
                var log;
                var bul = 0;
                if ($scope.menu[0].checked)
                    return true;
                angular.forEach(objects, function (object, key) {
//                console.log(value);

                    angular.forEach(object, function (material, key) {
                        if ($scope.filterM.indexOf(material.catid) !== -1)
                            bul += 1
                    });




                }, log);
                if (bul > 0) {
                    return 1;
                }
                else {
                    return 0;
                }
//            if($scope.menu[0].checked)
//                return true;
//            return $scope.filterM.indexOf(material.catid) !== -1;
            });
    };



    $scope.filteredMaterials = function (material) {
        if ($scope.menu[0].checked)
            return true;
        return $scope.filterM.indexOf(material.catid) !== -1;

    };


    function get_new_content() {
//        var catid = '';
//        angular.forEach($scope.filterM, function (item, key) {
//            catid += item + ';';
//        });
//        link = link + '&catid=' + catid;
//        $http({method: 'GET', url: link})
//                .success(function (data, status, headers, config) {
//                    console.log(data);
//                    $scope.content = data;
//                })
//                .error(function (data, status, headers, config) {
//                    console.log(data);
//                });
    }


    $scope.set_filtr = function (i) {
        if (i != 0) {
            $scope.menu[0].checked = 0;
        } else {
            angular.forEach($scope.menu, function (value, key) {
                value.checked = 0;
            });
            $scope.menu[0].checked = 1;
            $scope.filterM = [];
            $scope.data = Content.get_conteiner($scope.filterM);
        }



        //Клик не по первому пункту меню

        if ($scope.menu[i].checked == 0) {
            if (i != 0) {
                $scope.filterM.push($scope.menu[i].id);
                $scope.data = Content.get_conteiner($scope.filterM);
                $scope.menu[i].checked = 1;
            }
        } else {
            if (i != 0) {
                $scope.menu[i].checked = 0;
                var log;
                var arr = [];
                angular.forEach($scope.filterM, function (value, key) {
                    if (value != $scope.menu[i].id)
                    {
                        arr.push(value);
//$scope.filterM.slice(1,key); //почему то не работает 
                    }
                }, log);

                $scope.filterM = arr;
                $scope.data = Content.get_conteiner($scope.filterM);
            }
        }
    }
    $scope.get_active = function () {
        if ($scope.menu[0].checked)
            return 'active';
    }


    $scope.sidebar = true;
    $scope.sidebar_show = function () {
        $scope.sidebar = $scope.sidebar === false ? true : false;
    };


//    foreach ($results as $key => $value) {
//            $images = json_decode($value->images);
//            $value->images = $images->image_intro;
//            $value->introtext = strip_tags($value->introtext);
//            $value->catid = (int) $value->catid;
//
//            if ($key % 7 != 0) {
//                $arr_small[] = $value;
//                if ((count($arr_small) == 2) || ($key + 1 == count($results))) {
//                    $conteiner [] = array('block' => $arr_small);
//                    unset($arr_small);
//                }
//            } else {
//                $arr_big[] = $value;
//                $conteiner [] = array('block' => $arr_big);
//                unset($arr_big);
//            }
//        }






});
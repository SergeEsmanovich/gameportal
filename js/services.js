'use strict';

/* Services */

var gameServices = angular.module('gameServices', ['ngResource']);
//gameServices.factory('Content', ['$rootScope', '$http',
//    function ($rootScope, $http) {
//
//        var link = 'http://joomla/index.php/?task=getcontent&option=com_gameportal&tmpl=component&format=row&page=';
//
//        var service = {};
//        service.page = 1;
//
//        service.data = {};
//        service.loadcontent = function () {
//
//            $http({method: 'GET', url: link + service.page})
//                    .success(function (data, status, headers, config) {
//                        service.data.content = data;
//                        service.data.conteiner = service.get_content(data);
//                    })
//                    .error(function (data, status, headers, config) {
//                        console.log(headers);
//                    });
//            return  service.data;
//        }
//        service.loadmore = function (filterM) {
//            service.page += 10;
//            $http({method: 'GET', url: link + service.page})
//                    .success(function (data, status, headers, config) {
//                        //  service.data.content.push(data);
//                        service.data.content = service.data.content.concat(data);
//                        service.data.conteiner = service.get_content(service.data.content);
//                       // console.log(data.length);
//                       if(data.length==0)
//                        service.data.end = 1;
//                        // service.data.conteiner = service.get_conteiner(filterM);
//                    })
//                    .error(function (data, status, headers, config) {
//                        console.log(headers);
//                    });
//           // return  service.data;
//        }
//
//        service.get_content = function (content) {
//            var arr_small = [];
//            var arr_big = [];
//            var conteiner = [];
//            angular.forEach(content, function (value, key) {
//                if (key % 7 != 0) {
//                    arr_small.push(value);
//                    if ((arr_small.length == 2) || (key + 1 == content.length)) {
//                        conteiner.push({block: arr_small});
//                        arr_small = [];
//                    }
//                } else {
//                    arr_big.push(value);
//                    conteiner.push({block: arr_big});
//                    arr_big = [];
//                }
//            });
//            return  conteiner;
//        }
//
//        service.get_conteiner = function (filterM) {
//            var content = [];
//            filterM = typeof filterM !== 'undefined' ? filterM : [];
//
//
//            angular.forEach(service.data.content, function (value, key) {
//                if (filterM.indexOf(value.catid) !== -1) {
//                    content.push(value);
//                }
//
//            });
//
//            if (filterM.length > 0) {
//                service.data.conteiner = service.get_content(content);
//            }
//            else {
//                service.data.conteiner = service.get_content(service.data.content);
//            }
//            return service.data;
//        }
//
//
//
//
//
//
//        return service;
//    }]);


gameServices.factory('Content', ['$http',
    function ($http) {
        var service = function () {
            this.items = [];
            this.busy = false;
            this.after = '';
            this.page = 0;
            this.end = false;
            this.conteiner = [];
            this.filterM = [];
            //материал для открытия
            this.open;
            this.material;
        };

        service.prototype.find_material_by_alias = function (alias, callback) {
              var url = "/joomla/index.php/?task=getmaterial&option=com_gameportal&tmpl=component&format=row&alias=" + alias;
            $http.get(url).
                    success(function (data, status, headers, config) {
                       this.material = data;
                       if(typeof callback == 'function'){
                            callback();
                       }
                    }.bind(this)).
                    error(function (data, status, headers, config) {

                    });
        }



        service.prototype.format_conteiner = function () {
            this.conteiner = [];
            var arr_small = [];
            var arr_big = [];
            var temp_items = [];
            this.filterM = typeof this.filterM !== 'undefined' ? this.filterM : [];
            if (this.filterM.length > 0) {
                angular.forEach(this.items, function (value, key) {
                    if (this.filterM.indexOf(value.catid) !== -1) {
                        temp_items.push(value);
                    }
                }.bind(this));
            } else {
                temp_items = this.items;
            }


            angular.forEach(temp_items, function (value, key) {
                if (key % 7 != 0) {
                    arr_small.push(value);
                    if ((arr_small.length == 2) || (key + 1 == this.items.length)) {
                        this.conteiner.push({block: arr_small});
                        arr_small = [];
                    }
                } else {
                    arr_big.push(value);
                    this.conteiner.push({block: arr_big});
                    arr_big = [];
                }
            }.bind(this));

        }

        service.prototype.nextPage = function () {
            if (this.busy)
                return;
            this.busy = true;

            var url = "/joomla/index.php/?task=getcontent&option=com_gameportal&tmpl=component&format=row&page=" + this.page;
            $http.get(url).
                    success(function (data, status, headers, config) {
                        data = typeof data !== 'undefined' ? data : [];
//                        console.log(data);
                        if (data != null) {
                            if (data.length > 0) {
                                this.items = this.items.concat(data);
                                this.busy = false;
                                this.page += 1;
                                this.format_conteiner();
                            } else {
                                this.end = true;
                            }
                        } else {
                            this.end = true;
                        }
                    }.bind(this)).
                    error(function (data, status, headers, config) {

                    });

        };

        return service;
    }]);
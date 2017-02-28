
/*global angular*/

var app = angular.module('app', []);
app.controller('ctrl', [function ($scope) {
    'use strict';


}]);

app.filter('time', [function () {
    'use strict';

    return function (x) {
        return ((x < 10) ? '0' : '') + x + ':00';
    };
}]);

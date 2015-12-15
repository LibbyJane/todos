angular.module('todo')
.controller('ItemController', function ($http, $scope, $routeParams)
{
    var baseURL =  'http://localhost/';
    var URL = baseURL+'items/' + $routeParams.id;
    $http({
        method: 'GET', url: URL})
        .success(function(data){
            $scope.item = data[0];
            $scope.categories = data[1];
    });
});

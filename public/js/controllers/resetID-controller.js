angular.module('todo').controller('ResetIDController', function ($scope, $http, $window, $routeParams)
{
    var self = this;
    var baseURL =  'http://localhost/';
    $scope.ID = $routeParams.id;
    var URL = baseURL + 'reset/' + $routeParams.id;
    $http({ method: 'GET', url: URL})
    .success(function(data)
    {
        alert('status' + data.status);
        if (data.status == true)
        {
            $window.location='#/login';
        }
        else
        {
            $window.location='#/reset';   
        }            
    });
});

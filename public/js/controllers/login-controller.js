angular.module('todo').controller('LoginController', function ($scope, $http, $window)
{
    var self = this;
    var baseURL =  'http://localhost/';

    this.submit = function()
    {
        var URL = baseURL + 'login';
        $http({ method: 'POST', url: URL, data: {username: $scope.login.email, pword: $scope.login.pword }})
        .success(function(data){
            $window.location='#/';  
    });
    };   
});

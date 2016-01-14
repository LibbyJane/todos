angular.module('todo').controller('RegisterController', function ($scope, $http, $window)
{
    var self = this;
    var baseURL =  'http://localhost/';

    this.submit = function()
    {
        var URL = baseURL + 'register';
        $http({ method: 'POST', url: URL, data: {firstName: $scope.reg.fName, lastName: $scope.reg.sName, email: $scope.reg.email, password: $scope.reg.pword, passwordConf: $scope.reg.confPword }})
        .success(function(data){
            $window.location='#/';  
    });
    };   
});

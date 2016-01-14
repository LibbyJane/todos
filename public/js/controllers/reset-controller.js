angular.module('todo').controller('ResetController', function ($scope, $http, $window)
{
    var self = this;
    var baseURL =  'http://localhost/';

    this.submit = function()
    {
        $scope.DisplayUpdate = "hideForm";
        var URL = baseURL + 'reset';

        if ($scope.res.pword == $scope.res.confPword)
        {
            $http({ method: 'PUT', url: URL, data: {email: $scope.res.email, password: $scope.res.pword}})
            .success(function(data){
                $scope.fieldset = ''; 
        }); 
        }
    };   
});

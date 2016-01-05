angular.module('todo').controller('AddNewController', function ($scope, $http, $window)
{
    var self = this;
    var baseURL =  'http://localhost/';
    
    $http(
    {
        method: 'GET', url: baseURL+'categories'}).success(function(data){
            self.categories = data;
            
        $scope.newItem = {
            checkboxes: data
        };
    });     

    this.submit = function()
    {
        var URL = baseURL + 'addItem';
        $http({ method: 'POST', url: URL, data: $scope.newItem})
        .success(function(data){
            $window.location='#/';  
        });
    };   
});

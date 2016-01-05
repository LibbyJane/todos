angular.module('todo').controller('EditController', function ($scope, $http, $window, $routeParams)
{
    var self = this;
    var baseURL =  'http://localhost/';
    var id = $routeParams.id;
    console.log('id is ' + id);
    var URL = baseURL+'items/' + id;
    $scope.myDate = null;
    this.itemCategories = [];
    
    $http(
    {
        method: 'GET', url: URL}).success(function(data){
            $scope.item = data[0];
            self.itemCategories = data[1];
    });     
    
    $http(
    {
        method: 'GET', url: baseURL+'categories'}).success(function(data){
            $scope.categories = data;
            
            for (var i = 0; i < $scope.categories.length; i++)
            {
                
                $scope.categories[i].checked=false;
                
                for (var j = 0; j < self.itemCategories.length; j++)
                {
                    if (angular.equals($scope.categories[i].name, self.itemCategories[j].name) == true)
                    {
                        $scope.categories[i].checked=true;
                    }
                }
                
            }
    });  
    
    this.submit = function()
    {
        var submitURL = baseURL + 'updateItem/' + id;
        var submitURL2 = baseURL + 'updateItemCats/' + id;
        console.log('submitURL ' + submitURL );
        
        //update item data
        $http({ method: 'PUT', url: submitURL, data: $scope.item})
        .success(function(data){
            //update item categories
            $http({ method: 'PUT', url: submitURL2, data: $scope.categories})
            .success(function(data){  
                $window.location='#/';  
            });
        });
    };   
});

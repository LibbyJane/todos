angular.module('todo').controller('ListingController', function ($scope, $http, $window)
{
    var self = this;
    var baseURL =  'http://localhost/';

    this.loadItems = function(categoryID)
    {
        var URL = baseURL+'items';
        if (categoryID > 0 )
        {
            URL += '?category_id=' + categoryID;
        }
        
        // get all the to-do items from the database
        $http(
        {
            method: 'GET', url: URL}).success(function(data)
            {               
                if (data.status == false)
                {
                    $window.location='#/login';
                }
                else
                {
                    self.items = data.items;    
                        
                    $http(
                    {
                        method: 'GET', url: baseURL+'categories'}).success(function(data){
                            self.categories = data;
                    });   
                }
            });
    };

    $scope.categorySelected = function(catID){
        self.loadItems(catID);
    }; 
    
    $scope.logout = function(){
        $http(
        {
            method: 'GET', url: baseURL+'logout'}).success(function(){
                $window.location='#/login';
        }); 
    };
    
    $scope.deleteItem = function(itemID){
        if (confirm("Are you sure you want to delete this note?")) 
        {
            $http(
            {
                method: 'delete', url: baseURL+'item/'+itemID}).success(function(){
                    $window.location='#/';
            }); 
        }
        
        else
        {
            $window.location='#/';    
        }
    };    
    
    this.loadItems(0);
});

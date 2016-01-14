angular.module('todo').controller('AddNewController', function ($scope, $http, $window)
{
    var self = this;
    var baseURL =  'http://localhost/';
    this.itemCategories = [];   
    
    $scope.formatDate = function (date) {
        function pad(n) {
            return n < 10 ? '0' + n : n;
        }

        return date && date.getFullYear()
            + '-' + pad(date.getMonth() + 1)
            + '-' + pad(date.getDate());
    };

    $scope.parseDate = function (s) {
        var tokens = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);

        return tokens && new Date(tokens[1], tokens[2] - 1, tokens[3]);
    };       
    
    $http(
    {
        method: 'GET', url: baseURL+'categories'}).success(function(data)
        {
            $scope.categories = data;
            
            for (var i = 0; i < $scope.categories.length; i++)
            {
                $scope.categories[i].checked=false;
            }
    });      

    this.submit = function()
    {
        var URL = baseURL + 'addItem';   
        
        // add the item to the database
        $http({ method: 'POST', url: URL, data: $scope.newItem})
        .success(function(data)
        {
            //add item categories to the Items_Categories database
            var URL2 = baseURL + 'addItemCats/' + data.item_id;  
            $http({ method: 'POST', url: URL2, data: $scope.categories})
            .success(function(data){  
                $window.location='#/';  
            });
        });
    };   
});

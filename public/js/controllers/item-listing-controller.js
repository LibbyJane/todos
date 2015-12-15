angular.module('todo').controller('ListingController', function ($scope, $http)
{
    var self = this;
    var baseURL =  'http://localhost/';
    $http(
    {
        method: 'GET', url: baseURL+'items'}).success(function(data){
            self.items = data;
    });
});

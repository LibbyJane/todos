angular.module('todo')
.config(function($routeProvider){
    $routeProvider 
    .when('/', 
        {
            templateUrl: 'templates/listing.html', 
            controller: 'ListingController',
            controllerAs: 'listCtrl'  
    })
    .when('/items/:id', 
        {
            templateUrl: 'templates/item.html', 
            controller: 'ItemController',
            controllerAs: 'itemCtrl'   
    })    
    .otherwise({redirectTo: '/'})
});

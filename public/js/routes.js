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
    .when('/register',
    {
            templateUrl: 'templates/register.html', 
            controller: 'RegisterController',
            controllerAs: 'regCtrl'  
    })      
    .when('/login',
    {
            templateUrl: 'templates/login.html', 
            controller: 'LoginController',
            controllerAs: 'loginCtrl'  
    })
    .when('/reset',
    {
            templateUrl: 'templates/reset.html', 
            controller: 'ResetController',
            controllerAs: 'resetCtrl'  
    }) 
    .when('/reset/:id',
    {
            templateUrl: 'templates/resetID.html', 
            controller: 'ResetIDController',
            controllerAs: 'resetIDCtrl'  
    })     
    .when('/add',
    {
            templateUrl: 'templates/add.html', 
            controller: 'AddNewController',
            controllerAs: 'addCtrl'  
    })   
    .when('/edit/:id',
    {
            templateUrl: 'templates/edit.html', 
            controller: 'EditController',
            controllerAs: 'editCtrl'  
    })       
    .otherwise({redirectTo: '/items'})
});

'use strict';

angular.module('a4App', ['ngRoute', 'ngResource', 'ngCookies', 'validation.match',
 'ui.gravatar', 'ng.deviceDetector', 'angularMoment', 'angularUtils.directives.dirPagination', 'ngFileUpload'])
  .config(function ($routeProvider, $locationProvider){

  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .when('/logout', {
      templateUrl: 'views/home.html',
      controller: 'UserLogoutController'
    })
    .when('/login', {
      templateUrl: 'views/userLogin.html',
      controller: 'UserLoginController'
    })
    .when('/register', {
      templateUrl: 'views/userRegister.html',
      controller: 'UserRegisterController'
    })
    .when('/users', {
      templateUrl: 'views/users.html',
      controller: 'AllUserController'
    })
    .when('/users/:user_email', {
      templateUrl: 'views/user.html',
      controller: 'GetUserController'
    })
    .when('/users/:user_email/edit', {
      templateUrl: 'views/userEdit.html',
      controller: 'UserEditController'
    })
    .when('/usersBehaviors', {
      templateUrl: 'views/usersBehaviors.html',
      controller: 'UsersBehaviorsController'
    });
  //.otherwise({redirectTo: '/' });

  $locationProvider.html5Mode(true);

});





angular.module('a4App').controller('HomeController', function (){});



angular.module('a4App').controller('MainController', 
  function ($scope, $cookies, $rootScope, $window, $http, deviceDetector, $location){ 
  
  /* retrieves the current user from cookies */
  var currentUser = $cookies.getObject('user')
  if (currentUser) $rootScope.currentUser = currentUser;
  else $scope.isLoggedIn = false;  
  
  
  $scope.isUserAdmin = function(){
    if (!$rootScope.currentUser) return false;
    if ($rootScope.currentUser.role === 'super-admin' ||
      $rootScope.currentUser.role === 'admin')
      return true;

    return false;
  }

  $scope.$back = function(){
    window.history.back();
  }


  // for each page the user enters in, track information about the user
  $rootScope.$on("$locationChangeStart", function (event, currentRoute, previousRoute){
    if (!currentRoute) return;

    var userInfo = {
      user_email: ($scope.currentUser && $scope.currentUser.email) || '',
      os : deviceDetector.os,
      browser: {
        name : deviceDetector.browser,
        version: deviceDetector.browser_version
      },
      deviceType: deviceDetector.isMobile() ? 'mobile' : 'desktop',
      screenSize: {
        width: $window.innerWidth,
        height: $window.innerHeight
      },
      page: currentRoute
    };


    navigator.geolocation.getCurrentPosition(function (pos){
      // the position could be retrieved
      userInfo.latitude = pos.coords.latitude;
      userInfo.longitude = pos.coords.longitude;

      $http.post('/api/usersBehaviors', userInfo);
    }, function (err){
      // the position could not be retrieved
      $http.post('/api/usersBehaviors', userInfo);      
    }, {
      // if the position could not be triggered in 10 seconds,
      // call the error function
      timeout: 10000
    });


  });

  
  // watches for changes in the current user
  $rootScope.$watch(function (){
     return $rootScope.currentUser;
  }, function (newValue, oldValue){
    if (typeof $rootScope.currentUser !== 'undefined')
     $scope.isLoggedIn = true;
    else $scope.isLoggedIn = false;

    $scope.isAdmin = $scope.isUserAdmin();
  });


});






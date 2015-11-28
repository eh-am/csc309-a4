// login
angular.module('a4App').controller('UserLoginController', function ($scope, $http, $cookies, $location, $rootScope, User){
  // if the user is already logged in, redirect to home
  if ($scope.isLoggedIn) $location.path('/');

  $scope.login = function(){
    $http.post('/api/login', {username : $scope.user.username, password: $scope.user.password})
      .success(function (data, status){
        $rootScope.currentUser = data.user;

        $cookies.putObject('user', data.user);

        // after login, redirects to see all users
        $location.path('/users');
      })
      .error(function (data, status){
        $scope.loginError = "Email/Password incorrect.";
      });
  }
  
});


// logout
angular.module('a4App').controller('UserLogoutController', function ($scope, $cookies, $location, $rootScope){
  $cookies.remove('user');
  $rootScope.currentUser = undefined;

  
  $location.path('/');  
});



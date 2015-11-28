/* REST ROUTES */
angular.module('a4App').factory('User', function ($resource){
  return $resource('/api/users/:email', {id: '@email' }, {
    update: { method: 'PUT', params: { email: "@email" }},
});
});



/* VIEWS ROUTES */
angular.module('a4App').controller('AllUserController', function ($scope, User, $location){
  if (!$scope.isLoggedIn) $location.path('/');

  var users = User.query(function (){
    $scope.users = users;
  });
});


angular.module('a4App').controller('GetUserController', function ($scope, $routeParams, $location, $http, User){
  var user = User.get({ email: $routeParams.user_email} , function (us, header){
    // if the user doesn't exist or the current user doesn't have permission, redirect to home
    if (!user.email || !$scope.isLoggedIn){
      $location.path('/');
    }

    $scope.user = user;

    // if is an admin or the own user
    if ($scope.currentUser
        && ($scope.currentUser.email === user.email
            || $scope.currentUser.role === "admin"
            || $scope.currentUser.role === "super-admin")){
      $scope.canEdit = true;  
    }else {
      $scope.canEdit = false;
    }

    // if it's an admin, can delete the user
    if ($scope.currentUser 
        && ($scope.currentUser.role === "admin"
            || $scope.currentUser.role === "super-admin")){
      if ($scope.user.role === "regular"){
        // can only delete regular users
        $scope.canDelete = true;  
      } else $scope.canDelete = false;
    }else $scope.canDelete = false;

  });


  $scope.delete = function(user){
    $http.delete('/api/users/' + user.email)
      .success(function (data, status){
        $scope.$back();
      });
  }


  
});

angular.module('a4App').controller('UserEditController', function ($scope, $location, $routeParams, $cookies, User, Upload){
  
  if (!$scope.currentUser) $location.path('/');
  if ($scope.currentUser.role != "super-admin" &&
      $scope.currentUser.role != "admin" &&
      $scope.currentUser.email != $routeParams.user_email){

    $location.path('/');
  }

  var user = User.get({ email: $routeParams.user_email} , function (){
    $scope.user = user;

    if ($scope.currentUser.role == "super-admin" && $scope.user.role != "super-admin"){
      $scope.isSuperAdmin = true;
    }else $scope.isSuperAdmin = false;
  });




  $scope.update = function(user, isValid){
    if (!isValid) return;

      // if there's a file to upload
      if ($scope.file){
        // upload the file
        Upload.upload({
          url: '/api/upload',
          data: {file: $scope.file}
        }).then(function (resp){
          // then update the user
          user.profile_image = "uploads/" + resp.data;

          $scope.user.$update(function (){
            $scope.submissionSuccess = true;
            $cookies.putObject('user', user);
          });

        });
      }else {
        // just update the user
        $scope.user.$update(function (){
          $scope.submissionSuccess = true;
          $cookies.putObject('user', user);
        });

      }
        
  };


});


angular.module('a4App').controller('UserRegisterController', function ($scope, $routeParams, $location, User){
  
  $scope.user = new User();

  $scope.save = function(user, isValid){
    if (!isValid) return;

    $scope.user.$save(function (response){
      if (response.errmsg){
        $scope.errmsg = response.errmsg;
        return ;
      }
      $scope.user.password = "";
      $scope.user.passwordConfirm = "";
      

      $location.path('/login');
    });
  }
});


angular.module('a4App').controller('UsersBehaviorsController',
  function ($scope, $http){

  $http.get('/api/usersBehaviors').success(function (data, status){
      $scope.usersBehaviors = data;
  });

$http.get('/api/interestingUsersBehaviors').success(function (data, status){
  $scope.iub = data;
});


});
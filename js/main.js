var restifyvote = angular.module("restifyvote", ["firebase", "timer"]);

/*restifyvote.factory('statusService', ["$firebase", function ($firebase) {
    var startRef = new Firebase("https://restifyvote.firebaseio.com/start");
    return $firebase(startRef);
}]);*/

restifyvote.controller("MainController", ["$scope", "$firebase",
    function($scope, $firebase){
        //var playerRef = new Firebase("https://restifyvote.firebaseio.com/player_information");
        //var attackRef = new Firebase("https://restifyvote.firebaseio.com/attack_methods");
        //$scope.players = $firebase(playerRef);
        //$scope.attacks = $firebase(attackRef);
        //statusService.$bind($scope, "start");

        $scope.rootRef = $firebase(new Firebase("https://restifyvote.firebaseio.com"));
        
        $scope.voteplayer = function(index){
        	$scope.rootRef["player_information"][index].votes += 1;
            $scope.rootRef.$save();
        }

        $scope.voteattack = function(index){
        	$scope.rootRef["attack_methods"][index].votes += 1;
            $scope.rootRef.$save();
        }
        /*
        $scope.$on('timer-stopped', function (event, data){
        console.log('Timer Stopped - data = ', data);
        $scope.rootRef.start = false;
        console.log($scope.rootRef);
        });*/

    }]
);
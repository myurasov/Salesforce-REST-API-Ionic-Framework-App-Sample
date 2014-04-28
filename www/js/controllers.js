/**
 * Controllers
 */

app.controller('LayoutController', function ($scope, auth) {
  // save auth data
  $scope.onAuth = function (authData) {
    auth.set(authData);
  }
});

app.controller('TrackingController', function ($scope, auth, $rootScope) {

  $scope.input = {};

  var positionWatchId;

  $scope.$watch('input.enableTracking', function (val) {
    if (val) {

      var authData = auth.get();
      var positionList = [];
      $rootScope.positionObjectId = null;

      $.ajax({
        url: authData.instance_url + '/services/data/v29.0/sobjects/Position__c',
        type: 'POST',
        headers: {
          'Authorization': authData.token_type + ' ' + authData.access_token,
          'Content-type': 'application/json'
        },
        data: JSON.stringify({'Data__c': ''}),
      })

        .then(function ok(e) {

          $rootScope.$apply(function () {
            $rootScope.positionObjectId = e.id;
          })

          // start position watch
          positionWatchId = navigator.geolocation.watchPosition(function (e) {

            positionList.unshift([e.coords.latitude, e.coords.longitude]);

            // store only 25 recent positions
            if (positionList.length > 25) {
              positionList.splice(-1);
            }

            // update Position object

            $.ajax({
              url: authData.instance_url + '/services/data/v29.0/sobjects/Position__c/' + $rootScope.positionObjectId,
              type: 'PATCH',
              headers: {
                'Authorization': authData.token_type + ' ' + authData.access_token,
                'Content-type': 'application/json'
              },
              data: JSON.stringify({'Data__c': JSON.stringify(positionList)}),
            });

          });

        }, function err(e) {
          if (e.responseJSON[0].errorCode === 'INVALID_SESSION_ID') {
            // refresh access token
            $scope.input.enableTracking = false;
            auth.openLogin();
          } else {
            alert(e.responseJSON[0].message);
          }
        });

    } else if (positionWatchId) {
      // stop position watch
      navigator.geolocation.clearWatch(positionWatchId);
    }
  })

});

app.controller('HistoryController', function ($scope, $rootScope, $timeout, auth) {

  var authData = auth.get();
  var intervalId = null;

  if ($rootScope.positionObjectId) {
    update();
    intervalId = setInterval(update, 1000);
  }

  $scope.$on('$destroy', function () {
    clearInterval(intervalId);
  })

  function update() {

    $.ajax({
      url: authData.instance_url + '/services/data/v29.0/sobjects/Position__c/' + $rootScope.positionObjectId,
      type: 'GET',
      headers: {
        'Authorization': authData.token_type + ' ' + authData.access_token,
        'Content-type': 'application/json'
      }
    })
      .then(function ok(e) {
        $scope.$apply(function () {
          $scope.positions = JSON.parse(e.Data__c);
        })
      }, function err() {
      });
  }

});

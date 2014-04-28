/**
 * App configuration and initialisation
 */

// handle custom url scheme
function handleOpenURL(url) {

  var path = url.match('://(.*?)[\\?#]')[1];

  if (path == 'oauth-callback') {

    // get hash part
    var query = url.substr(url.indexOf("#") + 1);

    var data = {};

    // split into parts
    var parts = query.split('&');

    // read names and values
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].substr(0, parts[i].indexOf('='));
      var val = parts[i].substr(parts[i].indexOf('=') + 1);
      val = decodeURIComponent(val);
      data[name] = val;
    }

    // save auth using LayoutController

    var $scope = angular.element(document.body).scope();

    $scope.$apply(function () {
      $scope.onAuth(data);
    });
  }
}

//

var app = angular.module('SFSample', ['ionic'])

  .run(function ($ionicPlatform, $window) {
    $ionicPlatform.ready(function () {
      if ($window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

      .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: 'views/tabs.html'
      })

      .state('tab.tracking', {
        url: '/tracking',
        views: {
          'tab-tracking': {
            templateUrl: 'views/tab-tracking.html',
            controller: 'TrackingController'
          }
        }
      })

      .state('tab.history', {
        url: '/history',
        views: {
          'tab-history': {
            templateUrl: 'views/tab-history.html',
            controller: 'HistoryController'
          }
        }
      })

    // default state
    $urlRouterProvider.otherwise('/tab/tracking');

  })

  // check auth data
  .run(function ($ionicPlatform, auth) {

    $ionicPlatform.ready(function () {
      if (false === auth.get()) {
        auth.openLogin();
      }
    })
  })

  // configuration
  .constant('salesforce_client_id', '---your-app-client-id---')
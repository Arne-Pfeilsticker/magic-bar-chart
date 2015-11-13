(function (cApp) {
    'use strict';

    cApp.config(['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {

        $mdIconProvider
            .iconSet('content', './images/icons/content-icons.svg', 24)
            //.iconSet('device', './images/icons/device-icons.svg', 24)
            //.iconSet('editor', './images/icons/editor-icons.svg', 24)
            .iconSet('file', './images/icons/file-icons.svg', 24)
            //.iconSet('hardware', './images/icons/hardware-icons.svg', 24)
            //.iconSet('icons', './images/icons/icons-icons.svg', 24)
            //.iconSet('image', './images/icons/image-icons.svg', 24)
            //.iconSet('maps', './images/icons/maps-icons.svg', 24)
            .iconSet('navigation', './images/icons/navigation-icons.svg', 24)
            //.iconSet('notification', './images/icons/notification-icons.svg', 24)
            //.iconSet('social', './images/icons/social-icons.svg', 24)
            //.iconSet('toggle', './images/icons/toggle-icons.svg', 24)
        ;

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('deep-orange');

    }]);

    cApp.config(['$stateProvider', '$urlRouterProvider', configRoutes]);

    function configRoutes($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/home/home.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            .state('magicbarchart', {
                url: '/magicbarchart',
                templateUrl: 'app/magic-bar-chart/magic-bar-chart.html',
                controller: 'MagicBarChartController',
                controllerAs: 'vm'
                //resolve: {
                //    productTypes: ['nkfApi', function (nkfApi) {
                //        return nkfApi.getProductTypes();
                //    }],
                //    personsBooked: ['nkfApi', function (nkfApi) {
                //        return nkfApi.getPersonsBooked();
                //    }],
                //    framework: ['nkfApi', function (nkfApi) {
                //        return nkfApi.getFramework();
                //    }],
                //    frameworkShortcuts: ['nkfApi', function (nkfApi) {
                //        return nkfApi.getFrameworkShortcuts();
                //    }]
                //}
            })
        ;

        $urlRouterProvider.otherwise('/');
    }

    // app.run(['$rootScope', '$state', '$stateParams', 'stateWatcherService', function ($rootScope, $state, $stateParams, $stateWatcherService) {
    // jshint unused:false
    cApp.run(['$state', 'stateWatcherService', function ($state, stateWatcherService) {
        /* jshint validthis: true */
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        //$rootScope.$state = $state;
        //$rootScope.$stateParams = $stateParams;
    }]);

})(angular.module('cApp'));
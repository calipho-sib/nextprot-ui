// Karma configuration
// Generated on Mon Sep 30 2013 12:13:38 GMT+0200 (CEST)

//
// Jasmin API
// http://pivotal.github.io/jasmine/
//
// Protractor vs Karam
// http://stackoverflow.com/questions/17070522/can-protractor-and-karma-be-used-together

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '..',


    // frameworks to use
    frameworks: ['ng-scenario'],

    urlRoot: '/_karma_/',

    proxies: {
      '/': 'http://localhost:3000/'
    },

    // list of files / patterns to load in the browser
    files: [
      'test/e2e/**/*.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],

    plugins: [
        'karma-ng-scenario',
        'karma-story-reporter',
        'karma-chrome-launcher'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress','growl'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};

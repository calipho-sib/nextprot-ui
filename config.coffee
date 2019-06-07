production_environnement = false

# endpoint = if production_environnement then "https://d2t3grwcyftpfv.cloudfront.net/" else ""

endpoint = if production_environnement then "https://d2t3grwcyftpfv.cloudfront.net/" else ""
css_endpoint = if production_environnement then "https://d2t3grwcyftpfv.cloudfront.net/" else "../"

versionNumber = (Date.now());
vendorVersionNameJs = "js/vendor_"+versionNumber+".js"
appVersionNameJs = "js/app.js"
vendorVersionNameCss = "css/vendor_"+versionNumber+".css"
appVersionNameCss = "css/app_"+versionNumber+".css"

exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  conventions:
    assets:  /^app\/assets\//
    ignored: [/^(bower_components\/bootstrap-less(-themes)?|app\/styles\/overrides|(.*?\/)?[_]\w*)/,'bower_components/hydrolysis/hydrolysis.js','bower_components/viz.js/viz.js','bower_components/bootstrap-select/dist/js/bootstrap-select.js','bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.js','bower_components/bootstrap-timepicker/js/bootstrap-timepicker.js','bower_components/web-animations-js/web-animations.min.js','bower_components/jquery-ui/jquery-ui.js','bower_components/nextprot/dist/nextprot.js','bower_components/handlebars/handlebars.js','bower_components/auth0.js/dist/auth0.js','bower_components/angular-auth0/dist/angular-auth0.js','bower_components/angular-animate/angular-animate.js','bower_components/typeahead.js/dist/typeahead.bundle.js','bower_components/angular-mocks/angular-mocks.js','bower_components/marked/lib/marked.js','bower_components/angular-touch/angular-touch.js','bower_components/angular-loader/angular-loader.js','node_modules/auto-reload-brunch/vendor/auto-reload.js'
    ,'bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css','bower_components/bootstrap-select/dist/css/bootstrap-select.css','bower_components/bootstrap-select/less/bootstrap-select.less','bower_components/bootstrap/less/bootstrap.less','bower_components/font-awesome/less/font-awesome.less','bower_components/bootstrap/dist/css/bootstrap.css']
  modules:
    definition: false
    wrapper: false
  paths:
    public: 'build'
  files:
    javascripts:
      joinTo : {}
      order:
        before: [
            'bower_components/webcomponentsjs/webcomponents-lite.min.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jquery-ui/jquery-ui.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/angular/angular.js',
            'bower_components/codemirror/mode/sparql/sparql.js',
            'bower_components/showdown/src/showdown.js'
        ]

    stylesheets:
      joinTo: {}
      order:
        before: [
          'bower_components/bootstrap/dist/css/bootstrap.css',
          'bower_components/codemirror/lib/codemirror.css',
          'bower_components/codemirror/theme/twilight.css'
        ]
        after: [
          'bower_components/bootstrap/dist/css/bootstrap-theme.css'
        ]
        
    templates:
      joinTo: 'js/templates.js'

  keyword:
    # file filter
    filePattern: /\.(css|html)$/

    # By default keyword-brunch has these keywords:
    #     {!version!}, {!name!}, {!date!}, {!timestamp!}
    # using information from package.json
    map:
      distRelease: -> versionNumber
      uiVersion: -> versionNumber
      cssEndpoint: -> css_endpoint
      endpoint: -> endpoint



  # Enable or disable minifying of result js / css files.
  # minify: true
exports.config.files.javascripts.joinTo[vendorVersionNameJs] = /^(bower_components|vendor\/scripts)/
exports.config.files.javascripts.joinTo[appVersionNameJs] = /^app/
exports.config.files.stylesheets.joinTo[vendorVersionNameCss] = /^(bower_components|vendor\/styles)/
exports.config.files.stylesheets.joinTo[appVersionNameCss] = /^app/
exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  conventions:
    assets:  /^app\/assets\//
    ignored: /^(bower_components\/bootstrap-less(-themes)?|app\/styles\/overrides|(.*?\/)?[_]\w*)/
  modules:
    definition: false
    wrapper: false
  paths:
    public: 'build'
  files:
    javascripts:
      joinTo:
        'js/app.js': /^app/
        'js/vendor.js': /^(bower_components|vendor\/scripts)/
      order:
        before: [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/bootstrap/dist/js/bootstrap.js',
          'bower_components/angular/angular.js',
          'bower_components/codemirror/mode/sparql/sparql.js'
          'bower_components/showdown/src/showdown.js'
          'bower_components/showdown/src/extensions/github.js'
          'bower_components/showdown/src/extensions/table.js',
          'bower_components/showdown/src/extensions/twitter.js'
        ]

    stylesheets:
      joinTo:
        'css/vendor.css': /^(bower_components|vendor\/styles)/
        'css/app.css': /^app/
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
      distRelease: -> (Date.now())

  plugins:
    jade:
      pretty: yes # Adds pretty-indentation whitespaces to output (false by default)

  # Enable or disable minifying of result js / css files.
  # minify: true

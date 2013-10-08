# Nextprot SOLR

***CAUTION: Nextprot solr is in the very early stages of development. Things are likely
to change in ways that are not backwards compatible***

[AngularJS](http://angularjs.org) + [Brunch](http://brunch.io) + [Bootstrap](http://twitter.github.com/bootstrap/)

Main Client Features:
* Search
* Basket

## Backends
[solr](https://solr)

## Installation
  >sudo npm install -g karma
  >npm install

## Usage
  >node app


## Testing
Unit testing
  >npm run-script unit
Integration testing must start the application
  >node app&
  >npm run-script integration
Or use can directly work with karma
  >karma start test/karma.unit.js


## Deploying
  before deploying html we must rebase the web app
  in index.html
    <base href="/" />
  should be
    <base href="/protosearch/" />

  >./node_modules/.bin/brunch -m build
  >rsync -auv build/* np_integration@uat-web1:/home/np_integration/np-drupal/protosearch/



## start/kill solr
  >java -Dprotosearch.solr -Xmx512m -jar start.jar &
  >pkill -f protosearch.solr
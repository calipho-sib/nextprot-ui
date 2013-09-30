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
>npm install
>sudo npm install -g karma

## Usage
>node app


## Testing
>karma start test/config.js


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
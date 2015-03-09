Nextprot UI
===========

***CAUTION: Nextprot ui is in early stages of development. Things are likely to change in ways that are not backwards compatible***

[AngularJS](http://angularjs.org) + [Brunch](http://brunch.io) + [Bootstrap](http://twitter.github.com/bootstrap/)

Main Client Features:* Search* Basket

Backends
--------

[nextprot-api-web](https://github.com/calipho-sib/nextprot-api-web)

Installation
------------

> npm install

Usage
-----

> node app

Testing
-------

Unit testing `npm run-script` unit Integration testing must start the application `node app&` >npm run-script integration Or use can directly work with karma >karma start test/karma.unit.js

Deploying
---------

before deploying html, check the application base and the api location in index.html <base href="/" /> should be <base href="/protosearch/" />

in app/js/np.config.js the SOLR_SERVER variable should be correct (note this variable will be refactored to API_SERVER)

Troubleshooting
---------------

On a mac the command `node app` may not throw any error or exception, in order to make sure to see the error compile the code using `./node_modules/.bin/brunch build` instead.

build and minimize the project for production (do not use -m option to debug application)
-----------------------------------------------------------------------------------------

> ./node_modules/.bin/brunch build -m
>
> You can try to launch the build project using a simple http server like "serve ." or "mongoose"
> -----------------------------------------------------------------------------------------------
>
> Then deploy it in UAT
> ---------------------
>
> rsync -auv build/* npteam@uat-web2:/var/www/html/protosearch

start/kill solr
---------------

> java -Dprotosearch.solr -Xmx512m -jar -Djetty.port=8985 start.jar & pkill -f protosearch.solr

update your local solr indexes for entries, publications and terms
------------------------------------------------------------------

LOCAL_SOLR=$HOME/application/solr-4.4.0/example/solr SOLR_INDEX="npentries1 npentries1gold npcvs1 nppublications1" for index in $SOLR_INDEX; do rsync -Lavz --delete npteam@crick:/work/devtools/solr-4.5.0/example/solr/$index/ $LOCAL_SOLR/$index/ done

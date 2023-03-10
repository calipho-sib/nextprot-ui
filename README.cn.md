# neXtProt - The knowledge resource on human proteins

This is a code repository for the SIB - Swiss Institute of Bioinformatics CALIPHO group neXtProt project

See: https://www.nextprot.org/

# neXtProt User Interface (UI)

[AngularJS](http://angularjs.org) + [Brunch](http://brunch.io) + [Bootstrap](http://twitter.github.com/bootstrap/)

Prerequisites
-------------

node.js  - 6
npm      - 6.14.15
bower    - 1.8.4
Web server, apache 2.4

Backend API
---------
It is required to make the UI point to the correct API version. For the case of the mirror based in China, corresponding API URL to be specified.
This is done using a NX_ENV variable in np.js (line 43). 
If the API in mirror environment is cn-api.nextprot.org, NX_ENV should be 'cn'. Please also check the lines 67-69.


Building the application bundle
------------

> npm install 
> ./node_modules/.bin/bower install   
> ./node_modules/.bin/brunch build   
> ./node_modules/.bin/gulp 

This will build a 'build' directory in the root of the project directory. Note that it includes the index.html file along with other resources such as css, js, font, etc.
This folder contains the final web application, which needs to be deployed on a web server such as apache.


Run locally
-----

> node app

This will start a development server in port 3000

Deploying on a web server
-------------------------

The package built in the above step should be deployed on web server (we use apache 2.4). Once the  web application is built (/build folder), it should be copied to the respective folder in the web server.
Usual web server configurations need to be done. 
Note that, this web application is a single page application written in Angular.js (v1), so all the URLs need to be rewritten to the index.html file.
The htaccess file in this repository shows the apache directives to do this.
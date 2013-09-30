# Nextprot SOLR

***CAUTION: Nextprot solr is in the very early stages of development. Things are likely
to change in ways that are not backwards compatible***

[AngularJS](http://angularjs.org) + [Brunch](http://brunch.io) + [Bootstrap](http://twitter.github.com/bootstrap/)

Main Client Features:
* Search

## Backends
[solr](https://solr)

## Usage
>node app


# 1) proteins and proteinsgold
# update the remote solr indexes for entries, publications and terms
#
LOCAL_SOLR=$HOME/application/solr-4.3.0/example
SOLR_INDEX="npentries1 npentries1gold npcvs1 nppublications1"
for index in $SOLR_INDEX; do
	rsync -Lavz --delete $LOCAL_SOLR/solr/$index/ np_integration@uat-web1:/mnt/npdata/protosearch/solr/solr/$index/
done

# 3) restore local solr index files
#
LOCAL_SOLR=$HOME/application/solr-4.3.0/example
SOLR_INDEX="npentries1 npentries1gold npcvs1 nppublications1"
for index in $SOLR_INDEX; do
	rsync -avz --delete np_integration@uat-web1:/mnt/npdata/protosearch/solr/solr/$index/data $LOCAL_SOLR/solr/$index/data 
done

# 4) install angularjs and nodejs
#
LOCAL_ANGULAR=/Users/evaleto/workspaces/workspace-ndu/nextmodel/brunch
cd $LOCAL_ANGULAR
npm install
# before preparing the protosearch we must rebase the web site
# in index.html
    <base href="/" />
# should be
    <base href="/protosearch/" />

./node_modules/.bin/brunch -m build
node app
open http://localhost:3000


# 4) update angularjs
#
LOCAL_ANGULAR=/Users/evaleto/workspaces/workspace-ndu/nextmodel/brunch
cd $LOCAL_ANGULAR
./node_modules/.bin/brunch -m build
rsync -auv build/* np_integration@uat-web1:/home/np_integration/np-drupal/protosearch/


#
# start/kill solr
java -Dprotosearch.solr -Xmx512m -jar start.jar &
pkill -f protosearch.solr
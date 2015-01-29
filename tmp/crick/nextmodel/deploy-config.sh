#!/bin/bash

LOCAL_SOLR="./src/main/resources/solr"
SERVER_SOLR="npteam@crick:/work/devtools/solr-4.5.0"
EXCLUDE="--exclude '.svn'"
## read paramters
[ -z "$1" ] && {
	echo "usage $0 $SERVER_SOLR"
	exit 1
}
SERVER_SOLR=$1




## update the remote solr indexes for entries, publications and terms
SOLR_INDEX="npentries1 npentries1gold npcvs1 nppublications1"
for index in $SOLR_INDEX; do
  
  [ -e "$LOCAL_SOLR/$index/conf" ] || {
    echo "Oooops, could not open file :$LOCAL_SOLR/$index/conf"
    exit 1
  }
  echo "sync: $LOCAL_SOLR/$index/conf/ --> ${SERVER_SOLR}/example/solr/${index}/conf/"
  rsync $EXCLUDE -avz $LOCAL_SOLR/$index/conf/ "${SERVER_SOLR}/example/solr/${index}/conf/"
  wget --quiet /dev/null http://localhost:8985/solr/admin/cores?wt=json&action=RELOAD&core=$index
done  


echo "rebuild index with maven"
echo "MAVEN_OPTS=-Xmx1024m mvn exec:java -Dexec.args="NpEntries1Builder""

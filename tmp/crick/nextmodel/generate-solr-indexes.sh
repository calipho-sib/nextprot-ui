#!/bin/bash

if [ "$1" = "" ] || [ "$2" = "" ]; then
  echo "usage: $0 <db_host> <db_name> [ -reload ]"
  exit 1
fi
db_host=$1
db_name=$2
reload_opt=$3
db_url="jdbc:postgresql://$db_host/$db_name?user=postgres&password=postgres"

# delete old log of fourth index building process 
rm -f NpEntries1Builder.log

mvn exec:java -Dexec.mainClass=pam.app.NpIndexBuilder -Dexec.args="NpCvs1Builder $db_url $reload_opt" > NpCvs1Builder.log 2>&1 &
mvn exec:java -Dexec.mainClass=pam.app.NpIndexBuilder -Dexec.args="NpPublications1Builder $db_url $reload_opt" > NpPublications1Builder.log 2>&1 &
mvn exec:java -Dexec.mainClass=pam.app.NpIndexBuilder -Dexec.args="NpEntries1GoldBuilder $db_url $reload_opt" > NpEntries1GoldBuilder.log 2>&1 &

echo "building 3 first solr indexes from db_url: $db_url"

wait

echo "building last solr indexes from db_url: $db_url"

mvn exec:java -Dexec.mainClass=pam.app.NpIndexBuilder -Dexec.args="NpEntries1Builder $db_url " > NpEntries1Builder.log 2>&1

echo "done"



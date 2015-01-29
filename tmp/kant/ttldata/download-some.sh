#!/bin/bash
DIR=chromosome

control_c(){
  echo -en "\n*** Ouch! Exiting ***\n"
  exit 1
}

# trap keyboard interrupt (control-c)
trap control_c SIGINT


#[ -d chromosome ] && {
#  rm -r $DIR/*
#}

prefix="http://localhost:8080/nextprot-api"
files="rdf/schema.ttl " 
files="$files rdf/experimentalcontext.ttl"
files="$files rdf/terminology.ttl"
files="$files rdf/publication.ttl"
for i in {1..22} X Y MT unknown;do
  files="$files export/entries/chromosome/$i.ttl" 
done

for f in $files;do
  cd /work/projects/nextprot-api
  ./jetty.sh start
  cd /work/ttldata
  sleep 60
  wget -P $DIR $prefix/$f  
done


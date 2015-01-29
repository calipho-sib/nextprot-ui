#!/bin/bash
DIR=chromosome

control_c(){
  echo -en "\n*** Ouch! Exiting ***\n"
  exit 1
}

# trap keyboard interrupt (control-c)
trap control_c SIGINT


[ -d chromosome ] && {
  rm -r $DIR/*
}
wget -P $DIR http://localhost:8080/nextprot-api/rdf/schema.ttl
wget -P $DIR http://localhost:8080/nextprot-api/rdf/experimentalcontext.ttl
wget -P $DIR http://localhost:8080/nextprot-api/rdf/terminology.ttl
wget -P $DIR http://localhost:8080/nextprot-api/rdf/publication.ttl
for i in {1..22} X Y MT unknown;do
  echo "downloading chromosome $i"
  wget -P $DIR http://localhost:8080/nextprot-api/export/entries/chromosome/$i.ttl
done

#!/bin/bash
TRG_DIR=chromosome-new
API_SERVICE="http://localhost:8080/nextprot-api-web"

control_c(){
  echo -en "\n*** Ouch! Exiting ***\n"
  exit 1
}

# trap keyboard interrupt (control-c)
trap control_c SIGINT


[ -d "$TRG_DIR" ] && {
  rm -r $TRG_DIR/*
}
wget -P $TRG_DIR $API_SERVICE/rdf/schema.ttl
wget -P $TRG_DIR $API_SERVICE/rdf/experimentalcontext.ttl
wget -P $TRG_DIR $API_SERVICE/rdf/terminology.ttl
wget -P $TRG_DIR $API_SERVICE/rdf/publication.ttl
for i in {1..22} X Y MT unknown;do
  echo "downloading chromosome $i"
  wget -P $TRG_DIR $API_SERVICE/export/entries/chromosome/$i.ttl
done

# write summary of files written
echo "Download summary:"
for i in {1..22} X Y MT unknown; do 
  cnt=$(grep -c "a :Entry" $TRG_DIR/$i.ttl) 
  cnt2=$(grep -c "\\$" $TRG_DIR/$i.ttl)
  echo "wrote $cnt entries in $TRG_DIR/$i, found $cnt2 <$> in file" 
done




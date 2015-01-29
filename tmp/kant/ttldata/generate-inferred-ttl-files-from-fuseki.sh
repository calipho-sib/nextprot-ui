#!/bin/bash

# this dir
scripts_dir=/work/ttldata
# directory where input ttl files are to be found
ttl_dir=/work/ttldata/nobackup/chromosome-new
# output dir for ttl files generated
con_dir=/work/ttldata/nobackup/construct
# fuseki data dir
tdb_dir=/work/tdbdata
# fuseki server dir
fus_dir=/work/devtools/jena/jena-fuseki
# fuseki utility dir
jen_dir=/work/devtools/jena/apache-jena/bin
# fuseki config dir
cfg_file=/work/ttldata/config/config-tdb.ttl

# make :childOf transitive

query_construct_child_of_a=" \
  PREFIX : <http://nextprot.org/rdf#> \
  construct { ?s :childOf ?o .} where  { ?s :childOf+ ?o .}"

query_construct_child_of_b=" \
  PREFIX : <http://nextprot.org/rdf#> \
  construct { ?s :childOf ?s } where \
  {select distinct ?s  where { {?s :childOf ?_ . } UNION {?_ :childOf ?s } }}"


# make rdfs:subClassOf transitive

query_construct_subclass_of_a=" \
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  \
  construct { ?s rdfs:subClassOf ?o .} where  { ?s rdfs:subClassOf+ ?o .}"

query_construct_subclass_of_b=" \
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  \
  construct { ?s rdfs:subClassOf ?s } where \
  {select distinct ?s  where { {?s rdfs:subClassOf ?_ . } UNION {?_ rdfs:subClassOf ?s } }}"


first_files="\
  schema.ttl terminology.ttl"

constructed_files="\
  inferredChildOf-a.ttl inferredChildOf-b.ttl \
  inferredSubClassOf-a.ttl inferredSubClassOf-b.ttl"


d1=$(date)
rm $tdb_dir/*
rm $con_dir/*
rm $fus_dir/fuseki-tdb.log

cd $scripts_dir
./restart-fuseki
echo "sleeping 10 seconds to make sure fuseki is ready..."
sleep 10

for f in $first_files
do
  echo "posting $ttl_dir/$f..."
  $fus_dir/s-post http://localhost:3030/np/data default $ttl_dir/$f
done

echo "constructing inferred childOf triples, part 1 -> $con_dir/inferredChildOf-a.ttl..."
$fus_dir/s-query --service=http://localhost:3030/np/query "$query_construct_child_of_a" > $con_dir/inferredChildOf-a.ttl

echo "constructing inferred childOf triples, part 2 -> $con_dir/inferredChildOf-b.ttl..."
$fus_dir/s-query --service=http://localhost:3030/np/query "$query_construct_child_of_b" > $con_dir/inferredChildOf-b.ttl



echo "constructing inferred rdfs:subClassOf triples, part 1 -> $con_dir/inferredSubClassOf-a.ttl..."
$fus_dir/s-query --service=http://localhost:3030/np/query "$query_construct_subclass_of_a" > $con_dir/inferredSubClassOf-a.ttl

echo "constructing inferred rdfs:subClassOf triples, part 2 -> $con_dir/inferredSubClassOf-b.ttl..."
$fus_dir/s-query --service=http://localhost:3030/np/query "$query_construct_subclass_of_b" > $con_dir/inferredSubClassOf-b.ttl

# not mandatory step but  useful for verification sometimes
for f in $constructed_files
do
  echo "posting $con_dir/$f..."
  $fus_dir/s-post http://localhost:3030/np/data default $con_dir/$f
done

#echo "generating stats..."
#$jen_dir/tdbstats --desc=$cfg_file > mystats.opt
#mv mystats.opt $tdb_dir/stats.opt

cd $scripts_dir
./restart-fuseki
echo "sleeping 5 seconds..."
sleep 5


cat $fus_dir/fuseki-tdb.log

echo "please check log printed above for any error"

d2=$(date)
echo "started at $d1"
echo "ended   at $d2"



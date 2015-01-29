cd chromosome
/work/devtools/jena/apache-jena/bin/tdbloader2 --loc=/work/tdbdata/ schema.ttl
/work/devtools/jena/apache-jena/bin/tdbloader2 --loc=/work/tdbdata/ terminology.ttl
for i in {1..22}
do
/work/devtools/jena/apache-jena/bin/tdbloader2 --loc=/work/tdbdata/ $i.ttl
done

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
  cfg_dir=$index
  if [ "$cfg_dir" = "npentries1gold" ]; then 
    cfg_dir="npentries1"
  fi
  [ -e "$LOCAL_SOLR/$cfg_dir/conf" ] || {
    echo "Oooops, could not open file :$LOCAL_SOLR/$cfg_dir/conf"
    exit 1
  }
  mkdir -p ./tmp/remote/$index
  rm -rf ./tmp/remote/$index/*
  scp ${SERVER_SOLR}/example/solr/${index}/conf/schema.xml ./tmp/remote/$index/schema.xml
  scp ${SERVER_SOLR}/example/solr/${index}/conf/lang/stopwords_en.txt ./tmp/remote/$index/stopwords_en.txt
  res1=$(diff $LOCAL_SOLR/$cfg_dir/conf/schema.xml ./tmp/remote/$index/schema.xml | wc -l)
  echo "found $res1 line(s) different in $index schema.xml"
  res2=$(diff $LOCAL_SOLR/$cfg_dir/conf/lang/stopwords_en.txt ./tmp/remote/$index/stopwords_en.txt | wc -l)
  echo "found $res2 line(s) in $index stopwords_en.txt" 
done  


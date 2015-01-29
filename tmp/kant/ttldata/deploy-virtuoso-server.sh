#!/bin/sh

TRG_HOST=uat-web2

set -x

# stop local virtuoso server
isql 1111 dba dba exec="chekpoint;"

./stop-virtuoso.sh

# stop remote virtuoso server
ssh $TRG_HOST /work/ttldata/stop-virtuoso.sh

# clear the remote virtuoso directory but keep virtuoso.ini

ssh $TRG_HOST mkdir -p /var/lib/virtuoso/tmp
ssh $TRG_HOST cp /var/lib/virtuoso/db/virtuoso.ini /var/lib/virtuoso/tmp
ssh $TRG_HOST rm -rf /var/lib/virtuoso/db/*

# rsync virtuoso db local to remote

rsync -avz /var/lib/virtuoso/db/* $TRG_HOST:/var/lib/virtuoso/db
ssh $TRG_HOST rm /var/lib/virtuoso/db/virtuoso.trx
ssh $TRG_HOST cp /var/lib/virtuoso/tmp/virtuoso.ini /var/lib/virtuoso/db

# restart local and remote server
./restart-virtuoso
ssh $TRG_HOST /work/ttldata/restart-virtuoso



#!/bin/bash

# This script deploys PostgreSQL database between 2 machines.
# It stops postgresql on both <src> and <dest> hosts and rsync the npdb directory and restart postgresql.

# ex: bash deploy-npdb.sh kant uat-web2

set -x

function echoUsage() {
    echo "usage: $0 <src_host> <dest_host>"
}

function start_pg() {
    host=$1
    ssh npdb@${host} "pg_ctl -D /work/postgres/pg5432_nextprot/ start"
}

function stop_pg() {
    host=$1
    ssh npdb@${host} "pg_ctl -D /work/postgres/pg5432_nextprot/ stop -m immediate"
}

function copy_npdb() {
    src=$1
    dest=$2
    suffix=$3

    # The files are transferred in "archive" mode, which ensures that symbolic links, devices, attributes, permissions,
    # ownerships, etc. are preserved in the transfer.  Additionally, compression will be used to reduce the size of data
    # portions of the transfer.
    ssh npdb@${dest} "mkdir -p /work/postgres/pg5432_nextprot${suffix}"
    ssh npdb@${dest} "rsync -avz npdb@${src}:/work/postgres/pg5432_nextprot/ /work/postgres/pg5432_nextprot${suffix}"
}

function check_npdb() {
    host=$1

    MESS=$(ssh npdb@${host} "pg_ctl -D /work/postgres/pg5432_nextprot/ status|grep PID")

    echo ${MESS}

    if [ "MESS" = "" ]; then
        echo nextprotdb@$1 did not correctly restart ; exit 2
    fi

    #connect to psql
    #psql -dtemplate1
}

if [ "$1" = "" ] || [ "$2" = "" ]; then
  echoUsage; exit 1
fi

SRC_HOST=$1
DEST_HOST=$2

stop_pg ${SRC_HOST}
copy_npdb ${SRC_HOST} ${DEST_HOST} .back
start_pg ${SRC_HOST}

check_npdb ${DEST_HOST}

exit 0
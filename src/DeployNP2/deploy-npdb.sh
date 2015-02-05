#!/bin/bash

# cold backup: this script deploys PostgreSQL database between 2 machines.
# It stops postgresql on both <src> and <dest> hosts and rsync the npdb directory and restart postgresql.

# ex: bash deploy-npdb.sh kant uat-web2 npdb

set -x

function echoUsage() {
    echo "usage: $0 <src_host> <dest_host> <dest_user>" >&2
}

function start_pg() {
    host=$1
    user=$2
    ssh ${user}@${host} "pg_ctl -D /work/postgres/pg5432_nextprot/ start"
}

function stop_pg() {
    host=$1
    user=$2
    ssh ${user}@${host} "pg_ctl -D /work/postgres/pg5432_nextprot/ stop -m immediate"
}

function copy_npdb() {
    src=$1
    dest=$2
    user=$3
    suffix=$4

    ssh ${user}@${dest} "mkdir -p /work/postgres/pg5432_nextprot${suffix}"

    # The files are transferred in "archive" mode, which ensures that symbolic links, devices, attributes, permissions,
    # ownerships, etc. are preserved in the transfer.  Additionally, compression will be used to reduce the size of data
    # portions of the transfer.
    ssh ${user}@${src} "rsync -avz /work/postgres/pg5432_nextprot/ npdb@${dest}:/work/postgres/pg5432_nextprot${suffix}"
}

function check_npdb() {
    host=$1
    user=$2

    MESS=$(ssh ${user}@${host} "pg_ctl -D /work/postgres/pg5432_nextprot/ status|grep PID")

    echo ${MESS}

    if [ "MESS" = "" ]; then
        echo ${user}@${host} did not correctly restart ; exit 2
    fi
}

args=("$@")

if [ $# -lt 3 ]; then
  echo missing arguments >&2
  echoUsage; exit 1
fi

SRC_HOST=$1
DEST_HOST=$2
DEST_USER=$3
COLD_BACKUP=false

if [ $# -eq 4 ]; then
    COLD_BACKUP=true
fi


echo stop_pg ${SRC_HOST} ${DEST_USER} || exit 3
sleep 5

if [ COLD_BACKUP = "true" ]; then
    echo stop_pg ${DEST_HOST} ${DEST_USER} || exit 4
    echo copy_npdb ${SRC_HOST} ${DEST_HOST} ${DEST_USER} || exit 5
    echo start_pg ${DEST_HOST} ${DEST_USER} || exit 6
else
    echo copy_npdb ${SRC_HOST} ${DEST_HOST} ${DEST_USER} .back || exit 7
fi

echo start_pg ${SRC_HOST} ${DEST_USER} || exit 8

echo check_npdb ${DEST_HOST} ${DEST_USER} || exit 9

exit 0
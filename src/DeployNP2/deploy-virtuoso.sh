#!/bin/bash

# As npteam, this script deploys virtuoso between 2 machines.
# It stops virtuoso on both <src> and <dest> hosts and rsync the virtuoso db and then restart virtuoso.

set -x

function echoUsage() {
    echo "usage: $0 [-c][-v] <src_host> <dest_host>" >&2
}

function stop-virtuoso() {
    host=$1

    if pgrep virtuoso-t; then
        echo "killing virtuoso on ${host} and wait 5 seconds..."
        ssh npteam@${host} "kill $(pgrep virtuoso-t)"
        sleep 5
    else
        echo "virtuoso on ${host} was not running"
    fi
}

function restart-virtuoso() {
    host=$1

    stop-virtuoso ${host}

    echo "restarting virtuoso on ${host} and wait 5 seconds..."

    # virtuoso-t +configfile: use alternate configuration file
    ssh npteam@${host} "/usr/bin/virtuoso-t +configfile /var/lib/virtuoso/db/virtuoso.ini"
    sleep 5
}

function clear-virtuoso() {
    host=$1

    ssh npteam@${host} "mkdir -p /var/lib/virtuoso/tmp"
    ssh npteam@${host} "cp /var/lib/virtuoso/db/virtuoso.ini /var/lib/virtuoso/tmp"
    ssh npteam@${host} "rm -rf /var/lib/virtuoso/db/*"
}

function copyDb() {
    src=$1
    dest=$2

    # rsync virtuoso db local to remote
    ssh npteam@${src} "rsync -avz /var/lib/virtuoso/db/* ${dest}:/var/lib/virtuoso/db"
    ssh npteam@${dest} "rm /var/lib/virtuoso/db/virtuoso.trx"
    ssh npteam@${dest} "cp /var/lib/virtuoso/tmp/virtuoso.ini /var/lib/virtuoso/db"
}

args=("$*")

if [ $# -lt 2 ]; then
  echo missing arguments >&2
  echoUsage; exit 1
fi

SRC_HOST=$1
DEST_HOST=$2

ssh npteam@${SRC_HOST} isql 1111 dba dba exec="checkpoint;"

# stop virtuoso servers
stop-virtuoso ${SRC_HOST}
stop-virtuoso ${DEST_HOST}

# clear the remote virtuoso directory but keep virtuoso.ini
clear-virtuoso ${DEST_HOST}

# restart virtuoso servers
restart-virtuoso ${SRC_HOST}
restart-virtuoso ${DEST_HOST}
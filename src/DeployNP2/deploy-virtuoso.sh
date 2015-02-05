#!/usr/bin/env bash

# As npteam, this script deploys virtuoso between 2 machines.
# It stops virtuoso on both <src> and <dest> hosts and rsync the virtuoso db and then restart virtuoso.

# [virtuoso logs are here: /var/lib/virtuoso/db/virtuoso.log]

# ex: bash -c deploy-virtuoso.sh kant uat-web2

source "../strict-mode.sh"

set -x

function echoUsage() {
    echo "usage: $0 [-c][-v] <src_host> <dest_host>" >&2
}

function check-virtuoso-is-up() {
    host=$1

    if ! ssh npteam@${host} "pgrep virtuoso-t"; then
        echo "virtuoso on ${host} is unexpectedly down"
        return 1
    fi
    echo "virtuoso on ${host} is up as expected"

    return 0
}

function check-virtuoso-is-down() {
    host=$1

    if ssh npteam@${host} "pgrep virtuoso-t"; then
        echo "virtuoso on ${host} is unexpectedly up"
        return 1
    fi
    echo "virtuoso on ${host} is down as expected"

    return 0
}

function stop-virtuoso() {
    host=$1

    # Shut down the server resource: http://tw.rpi.edu/web/inside/endpoints/installing-virtuoso
    ssh npteam@${host} "isql 1111 dba dba -K"

    if [ ! $? = 0 ]; then
        echo "virtuoso on ${host} was not running"
    else
        sleep 5
    fi

    check-virtuoso-is-down ${host}
}

function start-virtuoso() {
    host=$1

    echo "restarting virtuoso on ${host} and wait 5 seconds..."

    # virtuoso-t +configfile: use alternate configuration file
    ssh npteam@${host} "/usr/bin/virtuoso-t +configfile /var/lib/virtuoso/db/virtuoso.ini"
    sleep 5

    check-virtuoso-is-up ${host}
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

    ssh npteam@${src} "rsync -avz --progress /var/lib/virtuoso/db/* ${dest}:/var/lib/virtuoso/db"
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

check-virtuoso-is-up ${SRC_HOST}
check-virtuoso-is-up ${DEST_HOST}

ssh npteam@${SRC_HOST} isql 1111 dba dba exec="checkpoint;"

# stop virtuoso servers
stop-virtuoso ${SRC_HOST}
stop-virtuoso ${DEST_HOST}

# clear the remote virtuoso directory but keep virtuoso.ini
clear-virtuoso ${DEST_HOST}

# copy db from source to dest host
time copyDb ${SRC_HOST} ${DEST_HOST}

# restart virtuoso servers
start-virtuoso ${SRC_HOST}
start-virtuoso ${DEST_HOST}


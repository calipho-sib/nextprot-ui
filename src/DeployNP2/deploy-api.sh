#!/bin/bash

#set -x
set -o errexit  # make your script exit when a command fails.
set -o pipefail # prevents errors in a pipeline from being masked. If any command in a pipeline fails, that return code will be used as the return code of the whole pipeline.
set -o nounset  # exit when your script tries to use undeclared variables.
#set -o xtrace   # trace what gets executed. Useful for debugging.



function stop_jetty() {
  host=$1
  ssh npteam@$host /work/jetty/bin/jetty.sh stop
  echo "Stopping jetty ..."
  while [ -f /work/jetty/jetty.pid ]
  do
    sleep 1
  done
  echo "Jetty has stopped in $1"
}

function start_jetty() {
  echo "Starting jetty ..."
  host=$1
  ssh npteam@$host "/work/jetty/bin/jetty.sh jetty start > /dev/null 2>&1 &"
  while [ grep STARTED /work/jetty/jetty.state ]
  do
    sleep 1
  done
  echo "Jetty has started in $1"
}

SRC_HOST=$1
TRG_HOST=$2


time stop_jetty ${SRC_HOST}


dirs="webapps cache repository"
for dir in $dirs; do
  echo "Copying directory $dir to ${TRG_HOST}"
  ssh npteam@${TRG_HOST} "rm -rf /work/jetty/${dir}.new"
  ssh npteam@${TRG_HOST} "mkdir /work/jetty/${dir}.new"
  ssh npteam@${SRC_HOST} "rsync -avz /work/jetty/${dir}/* npteam@${TRG_HOST}:/work/jetty/${dir}.new"
done

start_jetty ${SRC_HOST}



stop_jetty ${TRG_HOST}

dirs="webapps cache repository"
for dir in $dirs; do
  echo "Backing up directory $dir in ${TRG_HOST}"
  ssh npteam@${TRG_HOST} "rm -rf /work/jetty/${dir}.bak"
  ssh npteam@${TRG_HOST} "mv /work/jetty/${dir} /work/jetty/${dir}.bak "
  ssh npteam@${TRG_HOST} "mv /work/jetty/${dir}.new /work/jetty/${dir} "
done

start_jetty ${TRG_HOST}



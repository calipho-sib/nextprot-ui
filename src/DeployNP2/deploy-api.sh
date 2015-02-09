#!/bin/bash

color='\e[1;34m' # begin color
_color='\e[0m'   # end Color

#set -x
set -o errexit  # make your script exit when a command fails.
set -o pipefail # prevents errors in a pipeline from being masked. If any command in a pipeline fails, that return code will be used as the return code of the whole pipeline.
set -o nounset  # exit when your script tries to use undeclared variables.
#set -o xtrace   # trace what gets executed. Useful for debugging.

function stop_jetty() {
  host=$1

  if [ ! -f "ssh npteam@kant /work/jetty/jetty.pid" ]; then
      echo -e "${color}Jetty is not running at $host ${_color}"
      return 0
  fi

  ssh npteam@$host /work/jetty/bin/jetty.sh stop
  echo -e "${color}Stopping jetty ...${_color}"

  while [ -f "ssh npteam@kant /work/jetty/jetty.pid" ]; do
      sleep 1
  done

  echo -e "${color}Jetty has stopped at $host ${_color}"
}

function start_jetty() {
  echo -e "${color}Starting jetty ...${_color}"
  host=$1
  ssh npteam@$host "/work/jetty/bin/jetty.sh jetty start > /dev/null 2>&1 &"
  while [ ! ssh npteam@$host "grep STARTED /work/jetty/jetty.state" ]; do
      sleep 1
  done
  echo -e "${color}Jetty has started at $host ${_color}"
}

SRC_HOST=$1
TRG_HOST=$2

stop_jetty ${SRC_HOST}

dirs="webapps cache repository"
for dir in $dirs; do
  echo -e "${color}Copying directory $dir to ${TRG_HOST}${_color}"
  ssh npteam@${TRG_HOST} "rm -rf /work/jetty/${dir}.new"
  ssh npteam@${TRG_HOST} "mkdir /work/jetty/${dir}.new"

  if [ -d "ssh npteam@${SRC_HOST} /work/jetty/${dir}" ]; then
      ssh npteam@${SRC_HOST} "rsync -az /work/jetty/${dir}/* npteam@${TRG_HOST}:/work/jetty/${dir}.new"
  fi
done

start_jetty ${SRC_HOST}

stop_jetty ${TRG_HOST}

dirs="webapps cache repository"
for dir in $dirs; do
  echo -e "${color}Backing up directory $dir in ${TRG_HOST}${_color}"
  ssh npteam@${TRG_HOST} "rm -rf /work/jetty/${dir}.bak"
  ssh npteam@${TRG_HOST} "mv /work/jetty/${dir} /work/jetty/${dir}.bak "
  ssh npteam@${TRG_HOST} "mv /work/jetty/${dir}.new /work/jetty/${dir} "
done

start_jetty ${TRG_HOST}

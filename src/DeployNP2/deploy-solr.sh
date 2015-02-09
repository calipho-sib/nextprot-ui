#!/usr/bin/env bash

# This script deploys solr data between 2 machines. It stops solr service on both <src> and <target> hosts,
# rsync the solr directory and restart the solr services.

# Option no-clean: do not clean solr data directories on target server before copy
# ex: bash deploy-solr.sh crick uat-web2

# Warning: This script assumes that the solr config / indexes are up-to-date on <src_host>.
# TODO: instead of assuming it should check and exit if it is not the case

source "../strict-mode.sh"

SOLR_PID=""

function echoUsage() {
  echo "usage: $0 <src_host> <trg_host> [no-clean]"
}

function kill_solr() {

  HOST=$1
  get_solr_pid ${HOST}
  if [ "$SOLR_PID" = "" ];then
    echo "solr was not running on ${HOST}"
  else
    echo "killing solr process $SOLR_PID on ${HOST}"
    ssh ${HOST} kill ${SOLR_PID}
  fi
}

function get_solr_pid() {
  HOST=$1
  SOLR_PID=$(ssh ${HOST} ps -ef | grep java | grep nextprot.solr | tr -s " " | cut -f2 -d' ')
}

function restart_solr() {
  HOST=$1
  get_solr_pid ${HOST}
  if [ ! "$SOLR_PID" = "" ];then
    kill_solr ${HOST}
  fi
  echo "starting solr on $HOST"
  ssh ${HOST} "sh -c 'cd /work/devtools/solr-4.5.0/example; nohup java -Dnextprot.solr -Xmx1024m -jar -Djetty.port=8985 start.jar  > solr.log 2>&1  &'"
}

if [ "$1" = "" ] || [ "$2" = "" ]; then
  echoUsage; exit 1
fi

SRC_HOST=$1
TRG_HOST=$2
CLEAN_OPT="clean"

if [ ! "$3" = "" ];then
  if [ "$3" = "no-clean" ];then
    CLEAN_OPT="no-clean"
  else
    echoUsage; exit 2
  fi
fi

kill_solr ${SRC_HOST}
kill_solr ${TRG_HOST}

sleep 10

ssh ${TRG_HOST} mkdir -p /work/devtools/solr-4.5.0
if [  "$CLEAN_OPT" = "clean" ]; then
  ssh ${TRG_HOST} rm -rf /work/devtools/solr-4.5.0/*
fi
ssh ${TRG_HOST} rsync -avz ${SRC_HOST}:/work/devtools/solr-4.5.0 /work/devtools

sleep 5
restart_solr ${SRC_HOST}
sleep 5
restart_solr ${TRG_HOST}

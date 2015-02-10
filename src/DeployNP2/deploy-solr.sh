#!/usr/bin/env bash

# This script deploys solr data between 2 machines. It stops solr service on both <src> and <target> hosts,
# rsync the solr directory and restart the solr services.

# Option no-clean: do not clean solr data directories on target server before copy
# ex: bash deploy-solr.sh -n crick uat-web2

# options:
# -n: do not clean target
# -v: verbose mode

# Warning: This script assumes that the solr config / indexes are up-to-date on <src_host>.

set -o errexit  # make your script exit when a command fails.
set -o pipefail # prevents errors in a pipeline from being masked. If any command in a pipeline fails, that return code will be used as the return code of the whole pipeline.
set -o nounset  # exit when your script tries to use undeclared variables.

SOLR_PID=""

function echoUsage() {
  echo "usage: $0 [-nv] <src_host> <trg_host>"
}

# handle optional arg
no_clean_flag=

while getopts 'nv' OPTION
do
    case ${OPTION} in
    n)  no_clean_flag=1
        ;;
    v) set -x
        ;;
    ?) echoUsage
        exit 2
        ;;
    esac
done

shift $(($OPTIND - 1))

args=("$*")

if [ $# -lt 2 ]; then
  echo missing arguments >&2
  echoUsage; exit 1
fi

function kill_solr() {

  host=$1
  get_solr_pid ${host}
  if [ "$SOLR_PID" = "" ];then
    echo "solr was not running on ${host}"
  else
    echo "killing solr process $SOLR_PID on ${host}"
    ssh npteam@$${host} kill ${SOLR_PID}
  fi
}

function get_solr_pid() {
  host=$1
  SOLR_PID=$(ssh npteam@${host} ps -ef | grep java | grep nextprot.solr | tr -s " " | cut -f2 -d' ')
}

function check_solr() {
  host=$1

  if ! ssh npteam@${host} test -d /work/devtools/solr-4.5.0/; then
    echo "solr was not found at /work/devtools/solr-4.5.0/ on ${host}"
    exit 3
  fi
}

function restart_solr() {
  host=$1
  get_solr_pid ${host}
  if [ ! "$SOLR_PID" = "" ];then
    kill_solr ${host}
  fi
  echo "starting solr on ${host}"
  ssh npteam@$${host} "sh -c 'cd /work/devtools/solr-4.5.0/example; nohup java -Dnextprot.solr -Xmx1024m -jar -Djetty.port=8985 start.jar  > solr.log 2>&1  &'"
}

SRC_HOST=$1
TRG_HOST=$2

echo -n "checking solr is properly installed on ${SRC_HOST}... "
check_solr ${SRC_HOST}
echo "OK"

echo "killing solr on ${SRC_HOST} and ${TRG_HOST}"
kill_solr ${SRC_HOST}
kill_solr ${TRG_HOST}

sleep 10

echo "making solr dir on ${TRG_HOST}"
ssh npteam@${TRG_HOST} mkdir -p /work/devtools/solr-4.5.0
if [ ! ${no_clean_flag} ]; then
  echo "clearing solr on ${TRG_HOST}"
  ssh npteam@${TRG_HOST} rm -rf /work/devtools/solr-4.5.0/*
fi
echo "copying solr from ${SRC_HOST} to ${TRG_HOST}"
ssh npteam@${TRG_HOST} rsync -avz ${SRC_HOST}:/work/devtools/solr-4.5.0 /work/devtools

sleep 5
restart_solr ${SRC_HOST}
sleep 5
restart_solr ${TRG_HOST}

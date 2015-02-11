#!/bin/bash

# This script deploys web app content in dev,build,alpha or pro machine

# ex: bash deploy-ui.sh dev /Users/fnikitin/Projects/nextprot-ui/deploy.conf

set -x

set -o errexit  # make your script exit when a command fails.
set -o pipefail # prevents errors in a pipeline from being masked. If any command in a pipeline fails, that return code will be used as the return code of the whole pipeline.
set -o nounset  # exit when your script tries to use undeclared variables.
#set -o xtrace   # trace what gets executed. Useful for debugging.

color='\e[1;34m'         # begin color
error_color='\e[1;32m'   # begin error color
warning_color='\e[1;33m' # begin warning color
_color='\e[0m'           # end Color

function echoUsage() {
    echo "usage: $0 <[dev|build|alpha|pro]> <repo>" >&2
}

args=("$*")

if [ $# -lt 2 ]; then
  echo "missing arguments: Specify the environment where to deploy [dev,build,alpha,pro] and a directory"  >&2
  echoUsage; exit 1
fi

target=$1
repo=$2

if [ ! -d ${repo} ]; then
    echo -e "${error_color}${repo} is not a directory${_color}"
    exit 2
elif [ ! -f ${repo}/deploy.conf ]; then
    echo -e "${error_color}deploy.conf file was not found in ${repo}${_color}"
    exit 3
fi

source ${repo}/deploy.conf

cd ${repo}

echo "deploying to ${target}"
rm -rf build
./node_modules/.bin/brunch build -P

sedcmd="s/NX_ENV/$1/g"
sed ${sedcmd} build/js/app.js > tmp.dat
mv tmp.dat build/js/app.js

# for pro, send to plato, see target directory there
if [ $1 = "dev" ]; then
    rsync -auv build/* ${DEV_PATH}
elif [ $1 = "pro" ]; then
    rsync -auv build/* ${PRO_PATH}
elif [ $1 = "build" ]; then
    rsync -auv build/* ${BUILD_PATH}
elif [ $1 = "alpha" ]; then
    rsync -auv build/* ${ALPHA_PATH}
else
    echo "wrong environment"
fi




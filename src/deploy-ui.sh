#!/bin/bash

# This script deploys repo web app content in dev, build, alpha or pro machine

# ex1: bash -x deploy-ui.sh /Users/fnikitin/Projects/nextprot-ui/ dev
# ex2: bash deploy-ui.sh /Users/fnikitin/Projects/nextprot-snorql/ dev

source "./strict-mode.sh"

color='\e[1;34m'         # begin color
error_color='\e[1;32m'   # begin error color
warning_color='\e[1;33m' # begin warning color
_color='\e[0m'           # end Color

function echoUsage() {
    echo "usage: $0 <repo> <[dev|build|alpha|pro]>" >&2
}

args=("$*")

if [ $# -lt 2 ]; then
  echo "missing arguments: Specify the environment where to deploy [dev,build,alpha,pro] and a directory"  >&2
  echoUsage; exit 1
fi

repo=$1
target=$2

if [ ! -d ${repo} ]; then
    echo -e "${error_color}${repo} is not a directory${_color}"
    exit 2
elif [ ! -f ${repo}/deploy.conf ]; then
    echo -e "${error_color}deploy.conf file was not found in ${repo}${_color}"
    exit 3
fi

source ${repo}/deploy.conf

echo "entering repository ${repo}"
cd ${repo}

echo "brunching modules"
rm -rf build
./node_modules/.bin/brunch build -P

sedcmd="s/NX_ENV/${target}/g"
sed ${sedcmd} build/js/app.js > tmp.dat
mv tmp.dat build/js/app.js

echo "deploying to ${target}"

# for pro, send to plato, see target directory there
if [ ${target} = "dev" ]; then
    rsync -auv build/* ${DEV_PATH}
elif [ ${target} = "pro" ]; then
    rsync -auv build/* ${PRO_PATH}
elif [ ${target} = "build" ]; then
    rsync -auv build/* ${BUILD_PATH}
elif [ ${target} = "alpha" ]; then
    rsync -auv build/* ${ALPHA_PATH}
else
    echo "wrong environment"
fi




#!/bin/bash
set -x


stopDebugModeAndExit () {
  set +x; exit $1
}


callbackUrl="http://alpha-search.nextprot.org"
apiBase="http://uat-web2:8080/nextprot-api-web"

echo "should set at some point $callbackUrl" 
echo "should set at tome point $apiBase"

echo "deploy to alpha"
rm -rf build || stopDebugModeAndExit 1
./node_modules/.bin/brunch build -P || stopDebugModeAndExit 2
rsync -auv build/* npteam@uat-web2:/work/www/alpha-search.nextprot.org/ || stopDebugModeAndExit 3

set +x




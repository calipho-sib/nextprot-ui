#!/bin/bash
set -x


if [ -z "$1" ] 
    then 
        echo "Specify the environment where to deploy [dev,build,alpha]"
    exit 0
fi

stopDebugModeAndExit () {
  set +x; exit $1
}



echo "deploy to $1"
rm -rf build || stopDebugModeAndExit 1
./node_modules/.bin/brunch build -P || stopDebugModeAndExit 2


if [ $1 = "dev" ]; then
    sed 's/NX_ENV/dev/g' build/js/app.js > tmp.dat
    mv tmp.dat build/js/app.js
    rsync -auv build/* npteam@crick:/work/www/dev-search.nextprot.org/ || stopDebugModeAndExit 3
elif [ $1 = "build" ]; then
    sed 's/NX_ENV/build/g' build/js/app.js > tmp.dat
    mv tmp.dat build/js/app.js
    rsync -auv build/* npteam@kant:/work/www/build-search.nextprot.org/ || stopDebugModeAndExit 3
elif [ $1 = "alpha" ]; then
    sed 's/NX_ENV/alpha/g' build/js/app.js > tmp.dat
    mv tmp.dat build/js/app.js
    rsync -auv build/* npteam@uat-web2:/work/www/alpha-search.nextprot.org/ || stopDebugModeAndExit 3
else
    echo "wrong environment"
fi


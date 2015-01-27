#!/bin/bash

# Make and deploy a new release and prepare the next (increment the release version) for development (SNAPSHOT)

# Steps in branch master:
# merge develop to master, set pom.xml(s) release version number, commit/push to master, tag version and deploy to nexus
# Steps in branch develop:
# set pom.xml(s) develop version number, commit/push to master

# Create the release version 1.0.2 in branch master and prepare 1.0.3-SNAPSHOT in branch develop
# $ bash create-release.sh 1.0.2

RELEASE_VERSION=${1}

# start debug mode
set -x

stopDebugModeAndExit () {
  set +x; exit $1
}

calcNextVersion () {

  # release version $1=x.y.z
  xyz=$1
  # 1. extract z from x.y.z
  xy=${xyz%.*}
  z=${xyz##*.}

  # 2. increment z
  zplus1=$((z+1))

  # 3. construct and set dev version: x.y.z+1 to the 2nd argument
  eval "$2=$xy.$zplus1-SNAPSHOT"
}

if [ -z "$1" ]; then
    echo "Specify release version as first argument"
    stopDebugModeAndExit 0
fi

calcNextVersion $RELEASE_VERSION DEVELOPMENTVERSION

# change to branch master
git checkout master || stopDebugModeAndExit 1
git merge develop || stopDebugModeAndExit 2

# set new version in pom.xml
mvn versions:set -DnewVersion=$RELEASE_VERSION -DgenerateBackupPoms=false || stopDebugModeAndExit 3
git add pom.xml
git commit -m "New release version $RELEASE_VERSION" # returns -1 if nothing to commit || stopDebugModeAndExit 4
git push origin master || stopDebugModeAndExit 5
# tag
git tag -a v$RELEASE_VERSION -m "tag v$RELEASE_VERSION" || stopDebugModeAndExit 6
git push --tags || stopDebugModeAndExit 7
# deploy on nexus
mvn clean deploy || stopDebugModeAndExit 8

# change to branch develop
git checkout develop || stopDebugModeAndExit 9
mvn versions:set -DnewVersion=$DEVELOPMENTVERSION -DgenerateBackupPoms=false || stopDebugModeAndExit 10
git add pom.xml || stopDebugModeAndExit 11
git commit -m "New snapshot version $DEVELOPMENTVERSION" || stopDebugModeAndExit 12
git push origin develop || stopDebugModeAndExit 13

stopDebugModeAndExit 0




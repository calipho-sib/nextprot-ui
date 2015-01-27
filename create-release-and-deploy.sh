#!/bin/bash

# [should be executed by jenkins each time a push is done on master on branch master]

# This script makes and deploys a new release on nexus
# Tasks: merge develop to master, set pom.xml(s) release version number, commit/push to master, tag version and deploy to nexus

# start debug mode
set -x

stopDebugModeAndExit () {
    set +x; exit $1
}

# return the release version
getReleaseVersion () {

    # check it is a maven project
    if [ ! -f "pom.xml" ]; then

        echo "pom.xml was not found: not a maven project"
        stopDebugModeAndExit 1
    fi

    # get develop version (http://stackoverflow.com/questions/3545292/how-to-get-maven-project-version-to-the-bash-command-line)
    devVersion=`mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate -Dexpression=project.version | grep -Ev '(^\[|Download\w+:)'`

    if [[ ! ${devVersion} =~ [0-9]+\.[0-9]+\.[0-9]+-SNAPSHOT ]]; then

        echo "${devVersion} is not a develop version (missing -SNAPSHOT suffix)"
        stopDebugModeAndExit 2
    fi

    # return release version
    echo ${devVersion%-*}
}

# change to branch master
git checkout master || stopDebugModeAndExit 1
git merge -X theirs develop || stopDebugModeAndExit 2

# get release version of the maven project
RELEASE_VERSION=$(getReleaseVersion)

# set new version in pom.xml
mvn versions:set -DnewVersion=${RELEASE_VERSION} -DgenerateBackupPoms=false || stopDebugModeAndExit 3
git add pom.xml
git commit -m "New release version ${RELEASE_VERSION}" # returns -1 if nothing to commit || stopDebugModeAndExit 4

### Warning: the following push potentially could trigger a "chain reaction" of infinite call of this script !!
git push origin master || stopDebugModeAndExit 5

# tag
git tag -a v${RELEASE_VERSION} -m "tag v${RELEASE_VERSION}" || stopDebugModeAndExit 6
git push --tags || stopDebugModeAndExit 7

# deploy on nexus
mvn clean deploy || stopDebugModeAndExit 8

set +x;
exit 0




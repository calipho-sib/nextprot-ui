#!/bin/bash

# This script prepares and deploys a new release on nexus.

# [A merge of develop to master triggers this script]
# This script is triggered in a jenkins job each time a push is done on branch master.

# start debug mode
set -x

# return the next release version to prepare on master
getNextReleaseVersion () {

    # check it is a maven project
    if [ ! -f "pom.xml" ]; then

        echo "pom.xml was not found: not a maven project"
        exit 1
    fi

    # get develop version (http://stackoverflow.com/questions/3545292/how-to-get-maven-project-version-to-the-bash-command-line)
    devVersion=`mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate -Dexpression=project.version | grep -Ev '(^\[|Download\w+:)'`

    if [[ ! ${devVersion} =~ [0-9]+\.[0-9]+\.[0-9]+-SNAPSHOT ]]; then

        devName=`mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate -Dexpression=project.name | grep -Ev '(^\[|Download\w+:)'`

        echo "cannot release ${devName} v${devVersion}: not a snapshot (develop) version"
        exit 2
    fi

    # return release version
    echo ${devVersion%-*}
}

# change branch to master
git checkout master || exit 3

# get release version to prepare
RELEASE_VERSION=$(getNextReleaseVersion)

# prepare new version
mvn versions:set -DnewVersion=${RELEASE_VERSION} -DgenerateBackupPoms=false || exit 4

git add pom.xml
git commit -m "New release version ${RELEASE_VERSION}" # returns -1 if nothing to commit

# create a new release tag
git tag -a v${RELEASE_VERSION} -m "tag v${RELEASE_VERSION}" || exit 5
git push origin master --tags || exit 6

# deploy on nexus
mvn clean deploy || exit 7

exit 0

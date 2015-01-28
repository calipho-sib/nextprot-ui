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
        return 1
    fi

    # get develop version (http://stackoverflow.com/questions/3545292/how-to-get-maven-project-version-to-the-bash-command-line)
    DEV_VERSION=`mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate -Dexpression=project.version | grep -Ev '(^\[|Download\w+:)'`
    RELEASE_NAME=`mvn org.apache.maven.plugins:maven-help-plugin:2.1.1:evaluate -Dexpression=project.name | grep -Ev '(^\[|Download\w+:)'`

    if [[ ! ${DEV_VERSION} =~ [0-9]+\.[0-9]+\.[0-9]+-SNAPSHOT ]]; then

        echo "cannot release ${RELEASE_NAME} v${DEV_VERSION}: not a snapshot (develop) version"
        return 2
    fi

    RELEASE_VERSION=${DEV_VERSION%-*}

    return 0
}

# change branch to master
git checkout master

# get release version to prepare
if ! getNextReleaseVersion RELEASE_VERSION; then
    exit 1
fi

echo preparing ${RELEASE_NAME} v${RELEASE_VERSION}...

# prepare new version
mvn versions:set -DnewVersion=${RELEASE_VERSION} -DgenerateBackupPoms=false || exit 2

git add pom.xml
git commit -m "New release version ${RELEASE_VERSION}"

# create a new release tag
git tag -a v${RELEASE_VERSION} -m "tag v${RELEASE_VERSION}" || exit 3
git push origin master --tags || exit 4

# deploy on nexus
mvn clean deploy || exit 5

exit 0

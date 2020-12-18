#!/bin/bash

SETUP_SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/setup.sh"
source "${SETUP_SCRIPT}"

REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-topic"

npm install -g @okta/ci-append-sha

export TEST_SUITE_TYPE="build"

if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit $FAILED_SETUP
fi

npm config set @okta:registry ${REGISTRY}
if ! npm publish --registry ${REGISTRY}; then
  echo "npm publish failed! Exiting..."
  exit $PUBLISH_ARTIFACTORY_FAILURE
fi

exit $SUCCESS

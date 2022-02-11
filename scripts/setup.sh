#!/bin/bash

cd ${OKTA_HOME}/${REPO}

# Use project version of Node
setup_service node "$(cat .nvmrc)"

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Revert the cache-min setting, since the internal cache does not apply to
# these repos (and causes problems in lookups)
npm config set cache-min 10

if ! npm install; then
  echo "npm install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

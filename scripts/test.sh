#!/bin/bash

SETUP_SCRIPT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/setup.sh"
source "${SETUP_SCRIPT}"

if ! npm test; then
  echo "npm test failed! Exiting..."
  exit ${FAILED_SETUP}
fi

exit $SUCCESS

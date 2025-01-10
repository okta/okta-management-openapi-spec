#!/bin/bash

# NOTE: bacon starts with directory of this script as PWD, cd to root of repo
full_repo=${OKTA_HOME}/${REPO}
cd "${full_repo}" || exit 1

# Just have to return success so bacon will do the merge
exit ${SUCCESS}

set -euo pipefail

# Don't return null result on glob patterns
shopt -s nullglob

#set -a: Start auto-exporting all variables.
#set +a: Stop auto-exporting all variables.
set -a
source .env
set +a

#Install bump-cli
npm install -g bump-cli

hubTokenKey=${HUB_BUMP_TOKEN}
echo "Using global token ${hubTokenKey} for Okta Hub"

folderDate=${1} # for example 2024.06.1, 2024.07.0 to 2025.01.1
echo "folderDate: ${folderDate}"

for filename in dist/${folderDate}/*.{yml,yaml,json}; do
    [ -f "${filename}" ] || continue
    echo "Deploying ${filename}"

    basefile="${filename##*/}"
    name="${basefile%.*}"

    # Extract apiSlug (prefix before first '-')
    apiSlug="github-${name%%-*}"

    # Extract branchName (everything after first '-')
    branchName="${name#*-}"

    echo "* API ${apiSlug} (reading token from HUB_BUMP_TOKEN) from file ${filename}, on branch ${branchName}."
    bump deploy --doc "${apiSlug}" --token "${hubTokenKey}" --branch "${branchName}" "${filename}"
done

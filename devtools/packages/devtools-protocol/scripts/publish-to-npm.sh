#!/bin/bash

# This script publishes this repo to NPM

# It must be called with the Chromium commit rev as an argument
#     sh scripts/publish-to-npm.sh 485940

set -x

commit_rev=$1
local_script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# verify we have a real number
re='^[0-9]+$'
if ! [[ $commit_rev =~ $re ]] ; then
   echo "error: Not a number" >&2; exit 1
fi

# publish from repo root
cd "$local_script_path/.."

# bump and publish
if npm version --no-git-tag-version "0.0.$commit_rev"
then npm publish
fi


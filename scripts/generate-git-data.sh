#!/bin/sh
#
# Generate a Git data source for the entire repository to be consumed by the
# Hugo templates. Mainly done to produce a list of the most recent updates done
# to the website.
#
# Requires 'git'.

set -e

rootDir=$(git rev-parse --show-toplevel)
logDataFile="data/commits.yaml"

cd "$rootDir" || exit 1
mkdir -p "$(dirname "$logDataFile")" || exit 2

git log --no-merges --pretty=format:'
- hash: "%H"
  shortHash: "%h"
  date: "%ad"
  subject: "%s"
' --date=short > "$logDataFile"

#!/bin/bash
set -x

# Machine-specific path, naturally
local_script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
protocol_repo_path="$local_script_path/.."

browser_protocol_path="$protocol_repo_path/json/browser_protocol.json"
js_protocol_path="$protocol_repo_path/json/js_protocol.json"
tdf_protocol_path="$protocol_repo_path/json/tdf_protocol.json"
ios_protocol_path="$protocol_repo_path/json/ios"

# => into viewer
cd $local_script_path
local_tot_protocol_path="pages/_data/tot.json"
local_v8_protocol_path="pages/_data/v8.json"
local_protocol_path="pages/_data"

if ! [ -s $browser_protocol_path ]; then
  echo "error: couldn't find local protocol file" >&2; exit 1
fi

# copy ios protocol json
cp "$ios_protocol_path/Inspector-iOS-9.0.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-9.3.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-10.0.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-10.3.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-11.0.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-11.3.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-12.0.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-12.2.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-13.0.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-13.4.json" $local_protocol_path
cp "$ios_protocol_path/Inspector-iOS-14.0.json" $local_protocol_path

# copy tdf protocol json
cp $tdf_protocol_path $local_protocol_path

# copy the protocol.json over
cp $js_protocol_path $local_v8_protocol_path
# merge and create all our data files
node merge-protocol-files.js $browser_protocol_path $js_protocol_path > $local_tot_protocol_path

node make-stable-protocol.js

node create-search-index.js

# get the latest change
# => into chromium
cd $(dirname "$browser_protocol_path")
br_commit_line=$(git log --date=iso --no-color --max-count=1 -- browser_protocol.json | grep -E -o "^commit.*")
br_date_line=$(git log --date=iso --no-color --max-count=1 -- browser_protocol.json | grep -E -o "^Date.*")

cd $(dirname "$js_protocol_path")
js_commit_line=$(git log --date=iso --no-color --max-count=1 -- js_protocol.json | grep -E -o "^commit.*")
js_date_line=$(git log --date=iso --no-color --max-count=1 -- js_protocol.json | grep -E -o "^Date.*")

# copy it into the HTML file
# => into viewer
cd $local_script_path

# we no longer printing the most recent protocol git hashes.
# we can restore this when the devtools-protocol repo starts includes that data

cat pages/tot.md | sed -Ee "s/^(<code browser>)Date.*/\1$br_date_line/" > pages/tot.md.new
cat pages/tot.md.new | sed -Ee "s/^(<code js>)Date.*/\1$js_date_line/"  > pages/tot.md
rm -f pages/tot.md.new


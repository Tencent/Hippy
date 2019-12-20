#!/bin/sh

# Script path
BASE_PATH=$( cd "$(dirname "$0")" ; pwd -P );

# Target demo project path
DEMO_PATH="${BASE_PATH}/../examples/$1"

echo $BASE_PATH;
echo $DEMO_PATH;

if [ ! -d $DEMO_PATH ]; then
  echo "❌ Can not find demo project $@";
  exit;
fi;

pushd $DEMO_PATH
echo "1/3 Start to install $1 dependencies"
npm install
echo "2/3 Start to build project $1"
npm run hippy:vendor # Build vendor js
npm run hippy:build  # Build index js
echo "3/3 Copy the built files to native"
cp -rv ./dist/ios/* ../ios-demo/res/ # Update the ios demo project
cp -rv ./dist/android/* ../android-demo/res/ # Update the android project
popd
echo "👌 All done, you can open your native app now, enjoy."

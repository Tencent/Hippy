#!/bin/bash

if [[ ! `command -v cmake` ]] 
then
	echo 'cmake is not installed, install cmake first'
	exit 1
fi
cd ../../../devtools/devtools-integration/ios
rm -rf ./DevtoolsBackend
cmake ./CMakeLists.txt -B ./DevtoolsBackend -G Xcode -DMODULE_TOOLS=YES -DCMAKE_TOOLCHAIN_FILE=./ios.toolchain.cmake -DPLATFORM=OS64COMBINED -DENABLE_BITCODE=YES -DENABLE_ARC=YES -DDEPLOYMENT_TARGET=11.0 -DENABLE_INSPECTOR=YES
echo 'build ends'

#!/bin/bash

if [[ ! `command -v cmake` ]] 
then
	echo 'cmake is not installed, install cmake first'
	exit 1
fi
rm -rf devtools_backend
cmake ../../../devtools/devtools-integration/ios/CMakeLists.txt -B ./devtools_backend -G Xcode -DMODULE_TOOLS=YES -DCMAKE_TOOLCHAIN_FILE=./ios.toolchain.cmake -DPLATFORM=OS64COMBINED -DENABLE_BITCODE=YES -DENABLE_ARC=YES -DDEPLOYMENT_TARGET=11.0 -DENABLE_INSPECTOR=YES
echo 'build ends'

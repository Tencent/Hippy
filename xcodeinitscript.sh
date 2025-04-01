#!/bin/bash
#
# Tencent is pleased to support the open source community by making
# Hippy available.
#
# Copyright (C) 2022 THL A29 Limited, a Tencent company.
# All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
echo -e "\033[33m cmake build begin\033[0m"
if [[ ! `command -v cmake` ]]; then
	echo "\033[31m cmake is not installed, install cmake first \033[0m"
	exit 1
fi

root_dir=`pwd`
ios_tool_chain_path=${root_dir}/buildconfig/cmake/ios.toolchain.cmake
#devtools project
cd ./devtools/devtools-integration/ios
rm -rf ./DevtoolsBackend
cmake ./CMakeLists.txt -B ./DevtoolsBackend -G Xcode -DMODULE_TOOLS=YES -DCMAKE_TOOLCHAIN_FILE=${ios_tool_chain_path} -DPLATFORM=OS64COMBINED -DENABLE_ARC=YES -DDEPLOYMENT_TARGET=11.0 -DENABLE_INSPECTOR=YES -DCMAKE_POLICY_VERSION_MINIMUM=3.5
echo -e "\033[33m devtools cmake build end\033[0m"

#layout project - use taitank by deault
cd ${root_dir}/dom
rm -rf ./dom_project
layout_engine="Taitank"
if [[ ${1} ]]; then
	layout_engine=${1}
fi
cmake ./CMakeLists.txt -B ./dom_project -G Xcode -DMODULE_TOOLS=YES -DCMAKE_TOOLCHAIN_FILE=${ios_tool_chain_path} -DPLATFORM=OS64COMBINED -DDEPLOYMENT_TARGET=11.0 -DLAYOUT_ENGINE=${layout_engine}
echo -e "\033[33m dom cmake build end\033[0m"

if [[ "v8" == ${2} ]]; then
	echo "use v8 js engine"
	cd ${root_dir}
	rm -rf v8forios
	mkdir v8forios
	mkdir v8forios/arm64
	mkdir v8forios/x64

	#download and unzip arm64 bundle
	curl https://infra-packages.openhippy.com/hippy/global_packages/v8/9.8-lkgr/ios-arm64.tgz --output v8forios/arm64/arm64.tgz
	tar zxvf v8forios/arm64/arm64.tgz -C ./v8forios/arm64
	rm -f v8forios/arm64/arm64.tgz

	#download and unzip x64 bundle
	curl https://infra-packages.openhippy.com/hippy/global_packages/v8/9.8-lkgr/ios-x64.tgz --output v8forios/x64/x64.tgz
	tar zxvf v8forios/x64/x64.tgz -C ./v8forios/x64
	rm -f v8forios/x64/x64.tgz

	#move header to v8forios folder
	mkdir v8forios/v8
	mv v8forios/arm64/include v8forios/v8/include

	#merge libraries
	lipo -create v8forios/arm64/lib/libv8_monolith.a v8forios/x64/lib/libv8_monolith.a -output v8forios/v8/libv8.a

elif [[ "custom" == ${2} ]]; then
	echo "use custom js engine"
else
	echo "use default jsc js engine"
fi
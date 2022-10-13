#
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
#

SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
echo ${SCRIPTPATH}
export BUILD_DIR=${SCRIPTPATH}/Build

IOS_FRAMEWORK=${SCRIPTPATH}/../ios/rendercore.xcframework
MACOS_FRAMEWORK=${SCRIPTPATH}/../macos/rendercore.framework

if [ -e ${BUILD_DIR} ]
then
rm -r ${BUILD_DIR}
fi
mkdir ${BUILD_DIR}
echo ${BUILD_DIR}

if [ -e ${IOS_FRAMEWORK} ]
then
rm -r ${IOS_FRAMEWORK}
fi
w
if [ -e ${MACOS_FRAMEWORK} ]
then
rm -r ${MACOS_FRAMEWORK}
fi

xcodebuild -project ${SCRIPTPATH}/RenderCore.xcodeproj/ -scheme RenderCore -configuration Release -sdk iphoneos clean build BUILD_DIR=${BUILD_DIR}
xcodebuild -project ${SCRIPTPATH}/RenderCore.xcodeproj/ -scheme RenderCore -configuration Release -sdk iphonesimulator clean build BUILD_DIR=${BUILD_DIR}
xcodebuild -project ${SCRIPTPATH}/RenderCore.xcodeproj/ -scheme RenderCore -configuration Release -sdk macosx clean build BUILD_DIR=${BUILD_DIR}

xcodebuild -create-xcframework -framework ${BUILD_DIR}/Release-iphoneos/rendercore.framework -framework ${BUILD_DIR}/Release-iphonesimulator/rendercore.framework -output ${IOS_FRAMEWORK}
cp -R  ${BUILD_DIR}/Release/rendercore.framework ${SCRIPTPATH}/../macos/

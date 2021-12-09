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

if [ -e ${MACOS_FRAMEWORK} ]
then
rm -r ${MACOS_FRAMEWORK}
fi

xcodebuild -project ${SCRIPTPATH}/RenderCore.xcodeproj/ -scheme RenderCore -configuration Release -sdk iphoneos clean build BUILD_DIR=${BUILD_DIR}
xcodebuild -project ${SCRIPTPATH}/RenderCore.xcodeproj/ -scheme RenderCore -configuration Release -sdk iphonesimulator clean build BUILD_DIR=${BUILD_DIR}
xcodebuild -project ${SCRIPTPATH}/RenderCore.xcodeproj/ -scheme RenderCore -configuration Release -sdk macosx clean build BUILD_DIR=${BUILD_DIR}

xcodebuild -create-xcframework -framework ${BUILD_DIR}/Release-iphoneos/rendercore.framework -framework ${BUILD_DIR}/Release-iphonesimulator/rendercore.framework -output ${IOS_FRAMEWORK}
cp -R  ${BUILD_DIR}/Release/rendercore.framework ${SCRIPTPATH}/../macos/
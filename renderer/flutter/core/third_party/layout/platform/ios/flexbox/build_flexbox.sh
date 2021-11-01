SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
echo ${SCRIPTPATH}
export BUILD_DIR=${SCRIPTPATH}/Build

if [ -e ${BUILD_DIR} ]
then
rm -r ${BUILD_DIR}
fi
mkdir ${BUILD_DIR}
echo ${BUILD_DIR}

if [ -e ${SCRIPTPATH}/../flexbox.xcframework ]
then
rm -rf ${SCRIPTPATH}/../flexbox.xcframework
fi

if [ -e ${SCRIPTPATH}/../flexbox.framework ]
then
rm -rf ${SCRIPTPATH}/../flexbox.framework
fi

xcodebuild -project ${SCRIPTPATH}/flexbox.xcodeproj/ -scheme flexbox -configuration Release -sdk iphoneos clean build BUILD_DIR=${BUILD_DIR}
xcodebuild -project ${SCRIPTPATH}/flexbox.xcodeproj/ -scheme flexbox -configuration Release -sdk iphonesimulator clean build BUILD_DIR=${BUILD_DIR}

xcodebuild -project ${SCRIPTPATH}/flexbox.xcodeproj/ -scheme flexbox -configuration Release -sdk macosx clean build BUILD_DIR=${BUILD_DIR}

xcodebuild -create-xcframework -framework ${BUILD_DIR}/Release-iphoneos/flexbox.framework -framework ${BUILD_DIR}/Release-iphonesimulator/flexbox.framework -output ${SCRIPTPATH}/../flexbox.xcframework
cp -R  ${BUILD_DIR}/Release/flexbox.framework ${SCRIPTPATH}/../
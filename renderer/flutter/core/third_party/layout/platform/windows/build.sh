SCRIPTPATH=$(pwd)
BIN_DIR=${SCRIPTPATH}/../../../../../windows/libs/flexbox
BUILD_DIR=${SCRIPTPATH}/build


if [ -e ${BUILD_DIR} ]
then
rm -r ${BUILD_DIR}
fi
mkdir ${BUILD_DIR}

cd ${BUILD_DIR}

cmake ../ -DCMAKE_INSTALL_PREFIX=${BIN_DIR}
cmake --build . --config RelWithDebInfo --target INSTALL

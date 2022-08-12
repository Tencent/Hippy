#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
BIN_DIR=${SCRIPTPATH}/bin
BUILD_DIR=${SCRIPTPATH}/build
if [ -e ${BUILD_DIR} ]
then
rm -r ${BUILD_DIR}
fi
mkdir ${BUILD_DIR}

cd ${BUILD_DIR}

cmake ../ -DCMAKE_INSTALL_PREFIX=${SCRIPTPATH}/../libs/rendercore
cmake --build . --config RelWithDebInfo --target INSTALL
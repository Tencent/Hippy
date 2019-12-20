#! /bin/bash

CMAKE=`which cmake`
MAKE=`which make`

BASH_SOURCE_DIR=$(cd `dirname "${BASH_SOURCE[0]}"` && pwd)
BUILD_DIR="${BASH_SOURCE_DIR}"/../out

rm -rf "${BUILD_DIR}"/gtest
mkdir -p "${BUILD_DIR}"/gtest
cd "${BUILD_DIR}"/gtest

#cmake generate make file
"${CMAKE}" ../../gtest/

echo "Start build in directory: `pwd`"
#make gtest_hippy_layout executable
${MAKE}

#run gtest_hippy_layout, start gtest !!!
GTEST_RUN_PATH="${BUILD_DIR}"/gtest/gtest_hippy_layout
if [ -x "${GTEST_RUN_PATH}" ];then
${GTEST_RUN_PATH}
fi

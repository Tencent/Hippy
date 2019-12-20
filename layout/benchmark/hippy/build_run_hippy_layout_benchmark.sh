#! /bin/bash

CMAKE=`which cmake`
MAKE=`which make`

BASH_SOURCE_DIR=$(cd `dirname "${BASH_SOURCE[0]}"` && pwd)
BUILD_DIR="${BASH_SOURCE_DIR}"/../../out

rm -rf "${BUILD_DIR}"/hpbenchmark
mkdir -p "${BUILD_DIR}"/hpbenchmark
cd "${BUILD_DIR}"/hpbenchmark

#cmake generate make file
"${CMAKE}" ../../benchmark/hippy

echo "Start build in directory: `pwd`"
${MAKE}

#run hippy_layout_benchmark
BENCHMARK_RUN_PATH="${BUILD_DIR}"/hpbenchmark/hippy_layout_benchmark
if [ -x "${BENCHMARK_RUN_PATH}" ];then
${BENCHMARK_RUN_PATH}
fi

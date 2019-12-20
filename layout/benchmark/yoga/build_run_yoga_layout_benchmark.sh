#! /bin/bash

CMAKE=`which cmake`
MAKE=`which make`

BASH_SOURCE_DIR=$(cd `dirname "${BASH_SOURCE[0]}"` && pwd)
BUILD_DIR="${BASH_SOURCE_DIR}"/../../out

rm -rf "${BUILD_DIR}"/yogabenchmark
mkdir -p "${BUILD_DIR}"/yogabenchmark
cd "${BUILD_DIR}"/yogabenchmark

#cmake generate make file
"${CMAKE}" ../../benchmark/yoga

echo "Start build in directory: `pwd`"
${MAKE}

#run yoga_layout_benchmark
BENCHMARK_RUN_PATH="${BUILD_DIR}"/yogabenchmark/yoga_layout_benchmark
if [ -x "${BENCHMARK_RUN_PATH}" ];then
${BENCHMARK_RUN_PATH}
fi

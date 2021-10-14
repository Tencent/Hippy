#! /bin/bash

if [ -z "$ANDROID_NDK_HOME" -o -z "$CMAKE_MAKE_PROGRAM" ]; then
  echo "ANDROID_NDK_HOME or CMAKE_MAKE_PROGRAM variable not supplied.";
  exit -1;
fi

BASH_SOURCE_DIR=$(cd `dirname "${BASH_SOURCE[0]}"` && pwd)
CMAKE_TOOLCHAIN_FILE="${ANDROID_NDK_HOME}/build/cmake/android.toolchain.cmake"

ARCH_ARR=(armeabi-v7a arm64-v8a x86 x86_64)
HOST_TAG_ARR=(arm-linux-androideabi aarch64-linux-android i686-linux-android x86_64-linux-android)

INDEX=0
for CURRENT_ARCH in ${ARCH_ARR[@]}; do
  rm -rf "${BASH_SOURCE_DIR}/out/${CURRENT_ARCH}"
  mkdir -p "${BASH_SOURCE_DIR}/out/${CURRENT_ARCH}"
  cd "${BASH_SOURCE_DIR}/out/${CURRENT_ARCH}"

  "${CMAKE_MAKE_PROGRAM}/cmake"\
  -DANDROID_ABI="${CURRENT_ARCH}"\
  -DANDROID_TOOLCHAIN=clang\
  -DANDROID_NDK="${ANDROID_NDK_HOME}" \
  -DANDROID_PLATFORM=android-16\
  -DANDROID_STL=c++_static\
  -DCMAKE_TOOLCHAIN_FILE="${CMAKE_TOOLCHAIN_FILE}"\
  -DLIBRARY_OUTPUT_PATH="${BASH_SOURCE_DIR}/out/${CURRENT_ARCH}/lib.unstripped"\
  -G"Ninja" ../../../android/

  echo "Start ninja build in directory: `pwd` for ${CURRENT_ARCH}"

  "${CMAKE_MAKE_PROGRAM}/ninja"

  HOST_TAG=${HOST_TAG_ARR[$INDEX]}
  STRIP="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/${HOST_TAG}/bin/strip"
  $STRIP --strip-all -x "${BASH_SOURCE_DIR}/out/${CURRENT_ARCH}/lib.unstripped/libflexbox.so" -o "${BASH_SOURCE_DIR}/out/${CURRENT_ARCH}/libflexbox.so"

  INDEX=$INDEX+1
done

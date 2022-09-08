#
#
# Tencent is pleased to support the open source community by making
# Hippy available.
#
# Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

# region ABI_COMPILE_OPTIONS
if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  add_definitions("-DJS_V8")
  set(JS_ENGINE "V8")
  set(FRAMEWORK_ANDROID_DEPS android log)
  set(ABI_COMPILE_OPTIONS
          -fomit-frame-pointer
          -fno-threadsafe-statics
          -fno-strict-aliasing
          -fno-short-enums
          -fno-unique-section-names
          -fno-trigraphs
          -Werror
          -Wall
          -Wextra
          -Wextra-semi
          -Wconversion
          -Wimplicit-fallthrough
          -Wimplicit-int-conversion
          -Wloop-analysis
          -Wmissing-field-initializers
          -Wunused-local-typedefs
          -Wstring-conversion
          -Wthread-safety
          -Wtautological-overlap-compare
          -Wunreachable-code
          -Wenum-compare-conditional
          -Wheader-hygiene
          -Wshadow
          -Wno-unused-parameter
          -Wno-trigraphs
          --param=ssp-buffer-size=4
          -pipe
          -Os)
  message("ANDROID_ABI: ${ANDROID_ABI}")
  if (${ANDROID_ABI} STREQUAL "armeabi-v7a")
    set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
            -mfloat-abi=softfp)
  elseif (${ANDROID_ABI} STREQUAL "arm64-v8a")
    # (Empty)
  elseif (${ANDROID_ABI} STREQUAL "x86")
    set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
            -m32
            -mssse3
            -mfpmath=sse)
  elseif (${ANDROID_ABI} STREQUAL "x86_64")
    set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
            -m64
            -mpopcnt
            -msse4.2)
  else ()
    message(FATAL_ERROR "${ANDROID_ABI} is not supported")
  endif ()
  add_definitions("-DOS_ANDROID")
  add_definitions("-DANDROID")
elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
#  add_definitions("-DV8_WITHOUT_INSPECTOR")
  set(JS_ENGINE "JSC")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
  add_definitions("-DV8_WITHOUT_INSPECTOR")
  set(JS_ENGINE "JSC")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
  set(JS_ENGINE "V8")
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

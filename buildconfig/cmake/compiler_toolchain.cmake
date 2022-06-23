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

if (CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
  set(COMPILE_OPTIONS
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

  if (ANDROID_NDK)
    if (${ANDROID_ABI} STREQUAL "armeabi-v7a")
      list(APPEND COMPILE_OPTIONS -mfloat-abi=softfp)
    elseif (${ANDROID_ABI} STREQUAL "arm64-v8a")
      # Before LLVM 14 [1],
      # Outline atomics will crash on Samsung Exynos 9810 CPU [2]
      # with big cores are ARMv8.2 and LITTLE are ARMv8.0.
      # Since LSE is for ARMv8.1 and later, so it should be disabled.
      #
      # [1] https://reviews.llvm.org/rGcce4a7258b81159e57a411896011ee2742f17def
      # [2] https://bugs.chromium.org/p/chromium/issues/detail?id=1272795
      if (CMAKE_CXX_COMPILER_VERSION VERSION_LESS 14)
        list(APPEND COMPILE_OPTIONS -mno-outline-atomics)
      endif ()
    elseif (${ANDROID_ABI} STREQUAL "x86")
      list(APPEND COMPILE_OPTIONS
          -m32
          -mssse3
          -mfpmath=sse)
    elseif (${ANDROID_ABI} STREQUAL "x86_64")
      list(APPEND COMPILE_OPTIONS
          -m64
          -mpopcnt
          -msse4.2)
    endif ()
  endif ()
endif ()

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
            set(COMPILE_OPTIONS ${COMPILE_OPTIONS}
                    -mfloat-abi=softfp)
        elseif (${ANDROID_ABI} STREQUAL "x86")
            set(COMPILE_OPTIONS ${COMPILE_OPTIONS}
                    -m32
                    -mssse3
                    -mfpmath=sse)
        elseif (${ANDROID_ABI} STREQUAL "x86_64")
            set(COMPILE_OPTIONS ${COMPILE_OPTIONS}
                    -m64
                    -mpopcnt
                    -msse4.2)
        endif()
    endif()
endif()

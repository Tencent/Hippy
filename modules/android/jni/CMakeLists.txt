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

cmake_minimum_required(VERSION 3.13)

project(jni)

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME}
    PUBLIC include
    PRIVATE .)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region sources(.h header files are for IDE only, promote better integration)
set(SOURCE_SET
    src/jni_env.cc
    src/jni_register.cc
    src/jni_utils.cc
    src/scoped_java_ref.cc)
set(PUBLIC_HEADER_SET
    include/jni/jni_env.h
    include/jni/jni_register.h
    include/jni/jni_utils.h
    include/jni/scoped_java_ref.h)
target_sources(${PROJECT_NAME}
    PRIVATE ${SOURCE_SET}
    PUBLIC ${PUBLIC_HEADER_SET})
# endregion

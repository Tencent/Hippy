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

cmake_minimum_required(VERSION 3.14)

project("hippy")

get_filename_component(PROJECT_ROOT_DIR "${PROJECT_SOURCE_DIR}/../../../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EXTENSIONS off)
set(VISIBILITY_INLINES_HIDDEN on)

# region library
add_library(${PROJECT_NAME} SHARED)
target_include_directories(${PROJECT_NAME} PRIVATE ${PROJECT_SOURCE_DIR}/include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
target_link_libraries(${PROJECT_NAME} PRIVATE android)
if (HIDDEN_LIBRARY_SYMBOL)
  target_link_options(${PROJECT_NAME} PRIVATE
      "-Wl,--version-script=${PROJECT_SOURCE_DIR}/minimum_exports.lst")
endif ()
if (${ANDROID_STL} STREQUAL "c++_static")
  target_link_options(${PROJECT_NAME} PRIVATE
      "-Wl,--exclude-libs,libc++_static.a"
      "-Wl,--exclude-libs,libc++abi.a")
endif ()
# enable Safe ICF (Identical Code Folding) to optimize binary size
target_link_options(${PROJECT_NAME} PRIVATE
      "-Wl,--icf=safe")
# endregion

# region vfs
GlobalPackages_Add(vfs)
target_link_libraries(${PROJECT_NAME} PRIVATE vfs)
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region jni
GlobalPackages_Add(jni)
target_link_libraries(${PROJECT_NAME} PRIVATE jni)
# endregion

# region source set
set(SOURCE_SET
    src/entry.cc)

# This is a top-level shared library,
# so the source code visibility is always PRIVATE
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

# region export modules
foreach (MODULE IN LISTS MODULES)
  string(STRIP "${MODULE}" MODULE)
  if (IS_ABSOLUTE "${MODULE}")
    set(MODULE_PATH ${MODULE}/src/main/cpp)
    get_filename_component(TARGET_NAME "${MODULE}" NAME)
  else()
    set(MODULE_PATH ${PROJECT_ROOT_DIR}/framework/android/connector/${MODULE}/src/main/cpp)
    string(REPLACE "/" "_" TARGET_NAME "${MODULE}")
  endif()
  if (EXISTS "${MODULE_PATH}/CMakeLists.txt")
    add_subdirectory(${MODULE_PATH} ${CMAKE_CURRENT_BINARY_DIR}/connector/${TARGET_NAME})
    target_link_libraries(${PROJECT_NAME} PUBLIC connector_${TARGET_NAME})
  endif()
endforeach()
# endregion

#region link VectorLayout
if ("${LINK_VECTOR_LAYOUT}" STREQUAL "true")
  add_subdirectory("${PROJECT_ROOT_DIR}/framework/vectorlayout/android/library/src/main/jni" vectorlayout)
  target_link_libraries(${PROJECT_NAME} PRIVATE vectorlayout)
endif ()
# endregion
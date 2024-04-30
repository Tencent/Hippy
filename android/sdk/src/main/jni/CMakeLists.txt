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
set(CMAKE_VISIBILITY_INLINES_HIDDEN on)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EXTENSIONS off)

# region library
add_library(${PROJECT_NAME} SHARED)
target_include_directories(${PROJECT_NAME} PRIVATE ${PROJECT_SOURCE_DIR}/include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
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

# region core
add_subdirectory(${PROJECT_ROOT_DIR}/core ${CMAKE_CURRENT_BINARY_DIR}/core)
target_link_libraries(${PROJECT_NAME} PRIVATE core)
# endregion

# region v8
GlobalPackages_Add(v8)
target_link_libraries(${PROJECT_NAME} PRIVATE v8)
get_target_property(V8_WITHOUT_INSPECTOR v8 INTERFACE_V8_WITHOUT_INSPECTOR)
if (V8_WITHOUT_INSPECTOR)
  target_compile_definitions(${PROJECT_NAME} PRIVATE "V8_WITHOUT_INSPECTOR")
endif ()
# endregion

# region source set
set(SOURCE_SET
    src/bridge/adr_bridge.cc
    src/bridge/entry.cc
    src/bridge/java2js.cc
    src/bridge/js2java.cc
    src/bridge/runtime.cc
    src/jni/convert_utils.cc
    src/jni/exception_handler.cc
    src/jni/java_turbo_module.cc
    src/jni/jni_env.cc
    src/jni/jni_register.cc
    src/jni/jni_utils.cc
    src/jni/scoped_java_ref.cc
    src/jni/turbo_module_manager.cc
    src/jni/uri.cc
    src/loader/adr_loader.cc
    src/performance/memory.cc
    src/v8/heap_limit.cc
    src/v8/request_interrupt.cc
    src/v8/interrupt_queue.cc
    src/v8/stack_trace.cc)
# This is a top-level shared library,
# so the source code visibility is always PRIVATE.
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

add_subdirectory(${PROJECT_ROOT_DIR}/layout/android ${CMAKE_CURRENT_BINARY_DIR}/layout/android)

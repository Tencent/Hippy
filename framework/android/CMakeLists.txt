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

get_filename_component(PROJECT_ROOT_DIR "${PROJECT_SOURCE_DIR}/../.." REALPATH)

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
if (HIDDEN_LIBRARY_SYMBOL)
  set_target_properties(${PROJECT_NAME}
      PROPERTIES LINK_DEPENDS ${PROJECT_SOURCE_DIR}/minimum_exports.lst)
endif ()
if (${ANDROID_STL} STREQUAL "c++_static")
  target_link_options(${PROJECT_NAME} PRIVATE
      "-Wl,--exclude-libs,libc++_static.a"
      "-Wl,--exclude-libs,libc++abi.a")
endif ()
# endregion

## region v8
if ("${JS_ENGINE}" STREQUAL "V8")
  GlobalPackages_Add(v8)
  target_link_libraries(${PROJECT_NAME} PRIVATE v8)
  get_target_property(V8_WITHOUT_INSPECTOR v8 INTERFACE_V8_WITHOUT_INSPECTOR)
  if (V8_WITHOUT_INSPECTOR)
    target_compile_definitions(${PROJECT_NAME} PRIVATE "V8_WITHOUT_INSPECTOR")
  endif ()
endif ()
## endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region driver
GlobalPackages_Add(driver)
target_link_libraries(${PROJECT_NAME} PRIVATE driver)
# endregion

# region common_jni
GlobalPackages_Add(common_jni)
target_link_libraries(${PROJECT_NAME} PRIVATE common_jni)
# endregion

# region native renderer
add_subdirectory(${PROJECT_ROOT_DIR}/renderer/native/android/src/main/jni ${CMAKE_CURRENT_BINARY_DIR}/renderer/native)
target_link_libraries(${PROJECT_NAME} PUBLIC native_renderer)
# endregion

# region source set
set(SOURCE_SET
    src/bridge/bridge.cc
    src/bridge/entry.cc
    src/bridge/java2js.cc
    src/bridge/js2java.cc
    src/bridge/native_source_code_android.cc
    src/jni/exception_handler.cc
    src/jni/uri.cc
    src/loader/adr_loader.cc)
# TODO: modify the conditions, when moving into the framework
if (TARGET native_renderer)
  list(APPEND SOURCE_SET
      src/jni/convert_utils.cc
      src/jni/turbo_module_manager.cc
      src/jni/java_turbo_module.cc)
endif ()
# This is a top-level shared library,
# so the source code visibility is always PRIVATE
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

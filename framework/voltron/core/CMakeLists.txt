#
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
#

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  cmake_minimum_required(VERSION 3.14.0)
elseif ((CMAKE_SYSTEM_NAME STREQUAL "Darwin") OR (CMAKE_SYSTEM_NAME STREQUAL "iOS"))
  cmake_minimum_required(VERSION 3.19.0)
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
  cmake_minimum_required(VERSION 3.15.0)
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

cmake_policy(VERSION 3.0)

project("voltron_core")

add_definitions("-DVOLTRON")
set(VOLTRON TRUE)

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../.." REALPATH)

set(SOURCE_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(FRAMEWORK_DIR ${PROJECT_ROOT_DIR}/framework/)
set(RENDER_DIR ${PROJECT_ROOT_DIR}/renderer/voltron/core)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/compile_option.cmake)
include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/voltron_core.cmake)

# region footstone
GlobalPackages_Add(footstone)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} footstone)
# endregion

# region js_driver
add_subdirectory(${PROJECT_ROOT_DIR}/driver/js ${CMAKE_CURRENT_BINARY_DIR}/driver/js)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} js_driver)
# endregion

# region dom
GlobalPackages_Add(dom)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} dom)
# endregion

# region vfs
GlobalPackages_Add(vfs)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} vfs)
# endregion

# region devtools
if (ENABLE_INSPECTOR)
  GlobalPackages_Add(devtools_backend)
  set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} devtools_backend)
  GlobalPackages_Add(devtools_integration)
  set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} devtools_integration)
endif ()
# endregion

# region voltron renderer
add_subdirectory(${RENDER_DIR} ${CMAKE_CURRENT_BINARY_DIR}/render_core)
# endregion

# region library
add_library(${PROJECT_NAME} SHARED)
target_include_directories(${PROJECT_NAME} PRIVATE ${PROJECT_SOURCE_DIR}/include)
# endregion

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})

  # region stl
  if (${ANDROID_STL} STREQUAL "c++_static")
    target_link_options(${PROJECT_NAME} PRIVATE
            "-Wl,--exclude-libs,libc++_static.a"
            "-Wl,--exclude-libs,libc++abi.a")
  endif ()
  # endregion

  # region v8
  if ("${JS_ENGINE}" STREQUAL "V8")
    GlobalPackages_Add(v8)
    target_link_libraries(${PROJECT_NAME} PRIVATE v8)
    get_target_property(V8_WITHOUT_INSPECTOR v8 INTERFACE_V8_WITHOUT_INSPECTOR)
    if (V8_WITHOUT_INSPECTOR)
      target_compile_definitions(${PROJECT_NAME} PRIVATE "V8_WITHOUT_INSPECTOR")
    endif ()
  endif ()
  # endregion

  # region framework_core
  target_link_libraries(${PROJECT_NAME} PRIVATE ${FRAMEWORK_CORE_DEPS})
  # endregion

  # region voltron renderer
  target_link_libraries(${PROJECT_NAME} PUBLIC render_core)
  # endregion

  set(SOURCE_SET
          ${VOLTRON_CORE_SRC_FILES})
elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
  set_target_properties(${PROJECT_NAME} PROPERTIES
          FRAMEWORK TRUE
          MACOSX_FRAMEWORK_IDENTIFIER com.tencent.RenderCore
          MACOSX_FRAMEWORK_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/../VoltronCore/VoltronCore/Info.plist
          PUBLIC_HEADER "${DARWIN_HEADERS}"
          )
  set(LINKED_LIBS ${FRAMEWORK_CORE_DEPS})
  find_library(
          ${LINKED_LIBS}
  )
  find_library(JSCORE_LIBRARY JavaScriptCore)
  list(APPEND LINKED_LIBS -Wl,-framework,Security)
  list(APPEND LINKED_LIBS -Wl,-framework,Foundation)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreFoundation)
  list(APPEND LINKED_LIBS -Wl,-framework,SystemConfiguration)
  list(APPEND LINKED_LIBS -Wl,-framework,UIKit)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreTelephony)
  list(APPEND LINKED_LIBS -Wl,-framework,IOKit)
  list(APPEND LINKED_LIBS -Wl,-framework,QuartzCore)
  list(APPEND LINKED_LIBS -coverage)
  list(APPEND LINKED_LIBS -liconv)
  list(APPEND LINKED_LIBS -lresolv)
  list(APPEND LINKED_LIBS -lbsm)
  list(APPEND LINKED_LIBS -lz)

  target_link_libraries( # Specifies the target library.
          ${PROJECT_NAME}
          PRIVATE
          ${LINKED_LIBS}
          ${JSCORE_LIBRARY}
          )

  # region voltron renderer
  target_link_libraries(${PROJECT_NAME} PUBLIC render_core)
  # endregion

  set(SOURCE_SET
          ${VOLTRON_CORE_SRC_FILES}
          ${DARWIN_HEADERS})
elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
  set_target_properties(${PROJECT_NAME} PROPERTIES
          FRAMEWORK TRUE
          MACOSX_FRAMEWORK_IDENTIFIER com.tencent.RenderCore
          MACOSX_FRAMEWORK_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/../VoltronCore/VoltronCore/Info.plist
          PUBLIC_HEADER "${DARWIN_HEADERS}"
          )
  set(LINKED_LIBS ${FRAMEWORK_CORE_DEPS})
  find_library(
          ${LINKED_LIBS}
  )
  find_library(JSCORE_LIBRARY JavaScriptCore)
  list(APPEND LINKED_LIBS -Wl,-framework,Cocoa)
  list(APPEND LINKED_LIBS -Wl,-framework,Security)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreGraphics)
  list(APPEND LINKED_LIBS -Wl,-framework,Foundation)
  list(APPEND LINKED_LIBS -Wl,-framework,SystemConfiguration)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreText)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreServices)
  list(APPEND LINKED_LIBS -Wl,-framework,AppKit)
  list(APPEND LINKED_LIBS -Wl,-framework,IOKit)
  list(APPEND LINKED_LIBS -Wl,-framework,QuartzCore)
  list(APPEND LINKED_LIBS -coverage)
  list(APPEND LINKED_LIBS -liconv)
  list(APPEND LINKED_LIBS -lresolv)
  list(APPEND LINKED_LIBS -lbsm)
  target_link_libraries( # Specifies the target library.
          ${PROJECT_NAME}
          PRIVATE
          ${LINKED_LIBS}
          ${JSCORE_LIBRARY}
          )

  # region voltron renderer
  target_link_libraries(${PROJECT_NAME} PUBLIC render_core)
  # endregion

  set(SOURCE_SET
          ${VOLTRON_CORE_SRC_FILES}
          ${DARWIN_HEADERS})
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

# region source set
# This is a top-level shared library,
# so the source code visibility is always PRIVATE
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion




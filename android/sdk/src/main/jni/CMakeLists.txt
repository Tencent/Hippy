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

include("../../../../../buildconfig/cmake/InfraPackagesModule.cmake")
include("../../../../../buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_VISIBILITY_INLINES_HIDDEN on)
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_EXTENSIONS off)

if (${HIDDEN_LIBRARY_SYMBOL} STREQUAL "true")
  set(CMAKE_CXX_VISIBILITY_PRESET hidden)
endif()

if (${ANDROID_STL} STREQUAL "c++_static")
  string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,--exclude-libs,libc++_static.a")
  string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,--exclude-libs,libc++abi.a")
endif()

# region dependencies
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../../../../core/third_party/base ${CMAKE_CURRENT_BINARY_DIR}/core/third_party/base)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../../../../layout/android ${CMAKE_CURRENT_BINARY_DIR}/layout/android)
# endregion

# region source
get_filename_component(CORE_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../core" REALPATH)
file(GLOB_RECURSE CORE_SRC ${CORE_SRC_DIR}/src/*.cc)
file(GLOB_RECURSE JNI_SRC ${PROJECT_SOURCE_DIR}/src/*.cc)

message("CORE_SRC_DIR: ${CORE_SRC_DIR}")
message("CORE_SRC: ${CORE_SRC}")
message("JNI_SRC: ${JNI_SRC}")

include_directories(${PROJECT_SOURCE_DIR}/include)
include_directories(${CORE_SRC_DIR}/include)
include_directories(${PROJECT_SOURCE_DIR})
include_directories(${CORE_SRC_DIR}/third_party/base/include)
# endregion

set(HIPPY_DEPS android log tdf_base)
# region js_engine
message("JS_ENGINE:" ${JS_ENGINE})
if (${JS_ENGINE} STREQUAL "V8")
  InfaPackage_Add(V8
    REMOTE "third_party/v8/${V8_COMPONENT}/android-${ANDROID_ARCH_NAME}.tgz"
    LOCAL "${V8_COMPONENT}"
  )
  add_definitions("-DJS_V8")
  if (DEFINED V8_WITHOUT_INSPECTOR)
    add_definitions("-DV8_WITHOUT_INSPECTOR")
    file(GLOB_RECURSE INSPECTOR_SRC ${PROJECT_SOURCE_DIR}/src/inspector/*)
    list(REMOVE_ITEM JNI_SRC ${INSPECTOR_SRC})
  endif()
  # region remove jsc code
  file(GLOB_RECURSE JSC_SRC ${CORE_SRC_DIR}/src/napi/jsc/*)
  message("JSC_SRC: ${JSC_SRC}")
  list(REMOVE_ITEM CORE_SRC ${JSC_SRC})
  # endregion
  # region library
  if (${V8_LINKING_MODE} STREQUAL "shared")
    add_library(v8 SHARED IMPORTED)
    foreach(LIBRARY_DEP ${V8_LIBRARY_DEPS})
      add_custom_command(
              TARGET ${CMAKE_PROJECT_NAME} POST_BUILD
              COMMAND ${CMAKE_COMMAND} -E
              copy ${V8_LIBRARY_PATH}/${LIBRARY_DEP} $<TARGET_FILE_DIR:${CMAKE_PROJECT_NAME}>)
    endforeach()
  elseif (${V8_LINKING_MODE} STREQUAL "static")
    if (${HIDDEN_LIBRARY_SYMBOL} STREQUAL "true")
      string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,--exclude-libs,${V8_LIBRARY_NAME}")
    endif()
    add_library(v8 STATIC IMPORTED)
  else()
    message(FATAL_ERROR
            "V8_LINKING_MODE expected to be `shared` or `static`, but received ${V8_LINKING_MODE}")
  endif()
  set_property(TARGET v8 PROPERTY IMPORTED_LOCATION ${V8_LIBRARY_PATH}/${V8_LIBRARY_NAME})
  list(APPEND HIPPY_DEPS v8)
  # endregion
  foreach(INCLUDE_DIRECTORY ${V8_INCLUDE_DIRECTORIES})
    include_directories(${INCLUDE_DIRECTORY})
  endforeach()
  foreach(DEFINITION ${V8_DEFINITIONS})
    add_definitions(${DEFINITION})
  endforeach()
elseif (${JS_ENGINE} STREQUAL "JSC")
  add_definitions("-DJS_JSC")
  # region remove v8 code
  file(GLOB_RECURSE V8_SRC ${CORE_SRC_DIR}/src/napi/v8/*)
  message("V8_SRC: ${V8_SRC}")
  list(REMOVE_ITEM CORE_SRC ${V8_SRC})
  # endregion
else()
  message(FATAL_ERROR "${JS_ENGINE} is not supported")
endif()
# endregion

add_library(${CMAKE_PROJECT_NAME} SHARED ${CORE_SRC} ${URL_PARSER_SRC} ${JNI_SRC})
target_compile_options(${CMAKE_PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
if (${HIDDEN_LIBRARY_SYMBOL} STREQUAL "true")
  set_target_properties(${CMAKE_PROJECT_NAME}
          PROPERTIES LINK_DEPENDS ${PROJECT_SOURCE_DIR}/minimum_exports.lst)
endif()
target_link_libraries(${CMAKE_PROJECT_NAME} ${HIPPY_DEPS})

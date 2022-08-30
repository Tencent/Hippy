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
#

project(render_core)

set(RENDER_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(RENDER_CORE_SRC_DIR ${RENDER_CORE_DIR}/src)
set(CODEC_DIR ${RENDER_CORE_DIR}/third_party/codec)
set(CODEC_SRC_DIR ${RENDER_CORE_DIR}/third_party/codec/src)

set(PROJECT_ROOT_DIR ${RENDER_CORE_DIR}/../../..)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(SRC_FILES
        ${RENDER_CORE_SRC_DIR}/render/queue/render_queue.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/render_task.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/render_task_runner.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/voltron_render_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/bridge_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/bridge_define.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/callback_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/render_bridge_ffi_impl.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/string_convert.cc
        ${CODEC_SRC_DIR}/standard_codec.cc)

include_directories(${RENDER_CORE_DIR}/third_party/codec/include)
include_directories(${RENDER_CORE_DIR}/include)

set(DOM_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../dom)
set(LAYOUT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../layout)

include_directories(${LAYOUT_DIR})

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/${ANDROID_ABI})
endif()

if ("${BUILD_SHARED_LIB}" STREQUAL "true")
    #add base sub
    set(FRAMEWORK_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../driver/js/core)

    if (CMAKE_SYSTEM_NAME STREQUAL "Android")
        cmake_minimum_required(VERSION 3.4.1)
    elseif ((CMAKE_SYSTEM_NAME STREQUAL "Darwin") OR (CMAKE_SYSTEM_NAME STREQUAL "iOS"))
        cmake_minimum_required(VERSION 3.19.0)
    elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
        cmake_minimum_required(VERSION 3.15.0)
    endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

    if (CMAKE_SYSTEM_NAME STREQUAL "Android")
        add_library(${PROJECT_NAME} SHARED ${SRC_FILES})
        set_property(TARGET ${PROJECT_NAME} PROPERTY CXX_STANDARD 17)
        target_link_libraries(${PROJECT_NAME} ${LINKED_LIBS})
    elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
        add_library(${PROJECT_NAME} SHARED ${SRC_FILES})
        set_target_properties(${CMAKE_LIBRARY_NAME} PROPERTIES
                FRAMEWORK TRUE
                )
        target_link_libraries(${PROJECT_NAME} ${LINKED_LIBS})
    elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
        add_library(${PROJECT_NAME} SHARED ${SRC_FILES})
        set_target_properties(${CMAKE_LIBRARY_NAME} PROPERTIES
                FRAMEWORK TRUE
                )
        target_link_libraries(${PROJECT_NAME} ${LINKED_LIBS})
    endif (CMAKE_SYSTEM_NAME STREQUAL "Android")
else()
    add_library(${PROJECT_NAME} STATIC ${SRC_FILES})
    target_link_libraries(${PROJECT_NAME} ${LINKED_LIBS})
    set_property(TARGET ${PROJECT_NAME} PROPERTY CXX_STANDARD 17)
endif()

GlobalPackages_Add(dom)
target_link_libraries(${PROJECT_NAME} PRIVATE dom)

GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)

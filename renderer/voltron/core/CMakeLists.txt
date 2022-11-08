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

project(render_core)

set(RENDER_CORE_SRC_DIR ${CMAKE_CURRENT_SOURCE_DIR}/src)

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include(${PROJECT_ROOT_DIR}/framework/voltron/cmake/compile_option.cmake)

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/${ANDROID_ABI})
endif()

add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})

GlobalPackages_Add(dom)
target_link_libraries(${PROJECT_NAME} PRIVATE dom)

GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)

# region voltron_ffi
if (NOT TARGET voltron_ffi)
  add_subdirectory(${PROJECT_ROOT_DIR}/modules/voltron/ffi/core ${CMAKE_CURRENT_BINARY_DIR}/voltron/ffi)
endif()
target_link_libraries(${PROJECT_NAME} PUBLIC voltron_ffi)
# endregion

set(RENDERER_SRC_FILES
        ${RENDER_CORE_SRC_DIR}/render/queue/render_queue.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/render_task.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/render_task_runner.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/voltron_render_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/bridge/bridge_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/bridge/bridge_define.cc
        ${RENDER_CORE_SRC_DIR}/render/bridge/render_bridge_ffi_impl.cc)
target_sources(${PROJECT_NAME} PUBLIC ${RENDERER_SRC_FILES})

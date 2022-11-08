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

cmake_minimum_required(VERSION 3.14.0)

project("vfs")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../.." REALPATH)

set(SOURCE_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR})

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include(${PROJECT_ROOT_DIR}/framework/voltron/cmake/compile_option.cmake)

add_compile_options(-fexceptions)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region vfs
add_subdirectory(${PROJECT_ROOT_DIR}/modules/vfs/native ${CMAKE_CURRENT_BINARY_DIR}/vfs/native)
target_link_libraries(${PROJECT_NAME} PUBLIC vfs_native)
# endregion

# region voltron_ffi
if (NOT TARGET voltron_ffi)
  add_subdirectory(${PROJECT_ROOT_DIR}/modules/voltron/ffi/core ${CMAKE_CURRENT_BINARY_DIR}/voltron/ffi)
endif ()
target_link_libraries(${PROJECT_NAME} PRIVATE voltron_ffi)
# endregion

# region source set
set(VFS_SOURCE_SET src/url.cc
        src/handler/file_handler.cc
        src/handler/ffi_delegate_handler.cc
        src/wrapper.cc)

target_sources(${PROJECT_NAME} PRIVATE ${VFS_SOURCE_SET})
# endregion

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

project("vfs")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../" REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/InfraPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
# endregion

# region footstone
GlobalPackages_Add_footstone()
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region napi
GlobalPackages_Add_oh_napi()
target_link_libraries(${PROJECT_NAME} PUBLIC oh_napi)
# endregion

# region vfs
add_subdirectory(${PROJECT_ROOT_DIR}/modules/vfs/native ${CMAKE_CURRENT_BINARY_DIR}/vfs/native)
target_link_libraries(${PROJECT_NAME} PUBLIC vfs_native)
# endregion

# region source set
set(SOURCE_SET
  src/uri.cc
  src/vfs_resource_holder.cc
  src/handler/asset_handler.cc
  src/handler/file_handler.cc
  src/handler/napi_delegate_handler.cc)
set(PUBLIC_SOURCE_SET
  src/vfs_manager_napi.cc)

target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET} PUBLIC ${PUBLIC_SOURCE_SET})
# endregion

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

project("connector")

set(CPP_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(HIPPY_ROOT_DIR "${CPP_ROOT_DIR}/../../../../../")
set(PROJECT_ROOT_DIR "${HIPPY_ROOT_DIR}/../../")

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/InfraPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
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
target_link_libraries(${PROJECT_NAME} PRIVATE oh_napi)
# endregion

# region vfs
GlobalPackages_Add_vfs()
target_link_libraries(${PROJECT_NAME} PRIVATE vfs)
# endregion

# region dom
GlobalPackages_Add_dom()
target_link_libraries(${PROJECT_NAME} PRIVATE dom)
# endregion

# region js_driver
add_subdirectory(${PROJECT_ROOT_DIR}/driver/js ${CMAKE_CURRENT_BINARY_DIR}/_deps/driver/js)
target_link_libraries(${PROJECT_NAME} PUBLIC js_driver)
# endregion

GlobalPackages_Add_devtools_backend()
target_include_directories(${PROJECT_NAME} PUBLIC $<TARGET_PROPERTY:devtools_backend,INTERFACE_INCLUDE_DIRECTORIES>)

GlobalPackages_Add_devtools_integration()
target_include_directories(${PROJECT_NAME} PRIVATE $<TARGET_PROPERTY:devtools_integration,INTERFACE_INCLUDE_DIRECTORIES>)

# region native_renderer
add_subdirectory(${CPP_ROOT_DIR}/../renderer/native
  ${CMAKE_CURRENT_BINARY_DIR}/_deps/renderer/native)
target_link_libraries(${PROJECT_NAME} PUBLIC native_renderer)
# endregion

# region source set
set(PUBLIC_SOURCE_SET
  src/dom_manager_napi.cc
  src/js_driver_napi.cc
  src/ark2js.cc
  src/js2ark.cc
  src/exception_handler.cc
  src/native_renderer_napi.cc
  src/turbo_module_manager.cc
  src/arkts_turbo_module.cc
  src/setting_napi.cc
  src/turbo_utils.cc
  )
target_sources(${PROJECT_NAME} PUBLIC ${PUBLIC_SOURCE_SET})
# endregion

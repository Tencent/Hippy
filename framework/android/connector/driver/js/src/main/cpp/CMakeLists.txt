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

project("connector_driver_js")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_link_libraries(${PROJECT_NAME} PRIVATE android)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region jni
GlobalPackages_Add(jni)
target_link_libraries(${PROJECT_NAME} PRIVATE jni)
# endregion

# region vfs
GlobalPackages_Add(vfs)
target_link_libraries(${PROJECT_NAME} PRIVATE vfs)
# endregion

# region dom
GlobalPackages_Add(dom)
target_link_libraries(${PROJECT_NAME} PRIVATE dom)
# endregion

# region js_driver
add_subdirectory(${PROJECT_ROOT_DIR}/driver/js ${CMAKE_CURRENT_BINARY_DIR}/_deps/driver/js)
target_link_libraries(${PROJECT_NAME} PUBLIC js_driver)
# endregion

# region source set
set(SOURCE_SET
        src/exception_handler.cc
        src/convert_utils.cc
        src/turbo_module_manager.cc
        src/java_turbo_module.cc)
set(SOURCE_SET_STANDALONE
        src/java2js.cc
        src/js2java.cc
        src/js_driver_jni.cc)
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
target_sources(${PROJECT_NAME} PUBLIC ${SOURCE_SET_STANDALONE})
# endregion

#
# Tencent is pleased to support the open source community by making
# Hippy available.
#
# Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

project("connector_renderer_tdf")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
target_compile_definitions(${PROJECT_NAME} INTERFACE "ANDROID_TDF_RENDERER")
# endregion

# region dom
GlobalPackages_Add(dom)
# Just reference the `dom` header files, no library needed
target_include_directories(${PROJECT_NAME} PRIVATE $<TARGET_PROPERTY:dom,INTERFACE_INCLUDE_DIRECTORIES>)
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region jni
GlobalPackages_Add(jni)
target_link_libraries(${PROJECT_NAME} PRIVATE jni)
# endregion

# region tdf renderer
add_subdirectory(${PROJECT_ROOT_DIR}/renderer/tdf/android/src/main/cpp
        ${CMAKE_CURRENT_BINARY_DIR}/renderer/tdf)
target_link_libraries(${PROJECT_NAME} PUBLIC tdf_renderer)
# endregion

# region source set
set(SOURCE_SET_STANDALONE
        src/tdf_renderer_jni.cc)
target_sources(${PROJECT_NAME} PUBLIC ${SOURCE_SET_STANDALONE})
# endregion

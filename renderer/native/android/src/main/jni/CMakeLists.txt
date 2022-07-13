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

project("native_renderer")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
target_compile_definitions(${PROJECT_NAME} INTERFACE "ANDROID_NATIVE_RENDER")
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

# region atomic
GlobalPackages_Add(atomic)
target_link_libraries(${PROJECT_NAME} PRIVATE atomic)
target_include_directories(${PROJECT_NAME} PRIVATE $<TARGET_PROPERTY:atomic,INTERFACE_INCLUDE_DIRECTORIES>)
# endregion

# region jni common
# TODO: will be removed when the JNI library is complete
target_include_directories(${PROJECT_NAME} PRIVATE ${PROJECT_ROOT_DIR}/driver/js/android/src/main/jni/include)
# endregion

# region source set
set(SOURCE_SET
    src/render/native_render_manager.cc)
set(SOURCE_SET_STANDALONE
    src/render/native_render_jni.cc)
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# The linker treats `.a` and `.o` files are different:
#   * `.o` files from `.a` file only referenced `.o` object files are linked.
#   * `.o` files in the linker always go inside, referenced or not.
#
# The `SOURCE_SET_STANDALONE` including static initializers,
# so its visibility must be PUBLIC.
target_sources(${PROJECT_NAME} PUBLIC ${SOURCE_SET_STANDALONE})
# endregion

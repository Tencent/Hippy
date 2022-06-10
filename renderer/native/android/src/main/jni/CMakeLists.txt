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

project("native_render")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region jni
get_filename_component(JNI_DIR "${PROJECT_ROOT_DIR}/driver/js/android/src/main/jni" REALPATH)
include_directories(${JNI_DIR}/include)
# endregion

# region dom
get_filename_component(DOM_DIR "${PROJECT_ROOT_DIR}/dom" REALPATH)
include_directories(${DOM_DIR}/include)
# endregion

# region core
get_filename_component(CORE_DIR "${PROJECT_ROOT_DIR}/driver/js/core/" REALPATH)
include_directories(${CORE_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
# endregion

set(SOURCE_SET
        src/render/native_render_jni.cc
        src/render/native_render_manager.cc)
message("SOURCE_SET: ${SOURCE_SET}")

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
add_library(${PROJECT_NAME} STATIC ${SOURCE_SET})
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
target_link_libraries(${PROJECT_NAME})

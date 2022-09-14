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

project("tdf_renderer")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../.." REALPATH)

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
# region end

GlobalPackages_Add(jni)
target_link_libraries(${PROJECT_NAME} PUBLIC jni)

add_subdirectory(${PROJECT_ROOT_DIR}/renderer/tdf/common tdf_renderer_common/build)
target_link_libraries(${PROJECT_NAME} PUBLIC tdf_renderer_common)

# region source set
set(SOURCE_SET_STANDALONE
        src/render/tdf_render_bridge.cc)
# target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# The linker treats `.a` and `.o` files are different:
#   * `.o` files from `.a` file only referenced `.o` object files are linked.
#   * `.o` files in the linker always go inside, referenced or not.
#
# The `SOURCE_SET_STANDALONE` including static initializers,
# so its visibility must be PUBLIC.
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET_STANDALONE})
# endregion

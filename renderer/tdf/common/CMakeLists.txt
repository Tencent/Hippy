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

project("tdf_renderer_common")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../.." REALPATH)
get_filename_component(TDF_RENDER_DIR "${PROJECT_ROOT_DIR}/renderer/tdf" REALPATH)
get_filename_component(TDF_CORE_DIR "${TDF_RENDER_DIR}/core" REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC ${TDF_RENDER_DIR}/common/include)
# TODO: remove dependency of scope.h
target_include_directories(${PROJECT_NAME} PUBLIC ${PROJECT_ROOT_DIR}/driver/js/include)
# region end

target_compile_definitions(${PROJECT_NAME} INTERFACE "ENABLE_TDF_RENDER")

# regine tdfcore
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/include)
# entry.cc need use tdf_render_manager.h
# TODO: remove after tdfcore's include directory is cleaned.
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/third_party/skia)
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/third_party/angle/include)
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/third_party/json/single_include)
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/third_party/refl-cpp/include)
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/third_party/tracy)
target_include_directories(${PROJECT_NAME} PRIVATE ${TDF_CORE_DIR}/third_party/libpag/tgfx/include)

target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
# endregion

# region dom
GlobalPackages_Add(dom)
# Just reference the `dom` header files, no library needed
target_include_directories(${PROJECT_NAME} PUBLIC $<TARGET_PROPERTY:dom,INTERFACE_INCLUDE_DIRECTORIES>)
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PUBLIC footstone)
# endregion

# region jni
GlobalPackages_Add(jni)
target_link_libraries(${PROJECT_NAME} PUBLIC jni)
# endregion

# TODO: replace with a static tdfcore library
add_subdirectory(${TDF_CORE_DIR} tdfcore/build)
target_link_libraries(${PROJECT_NAME} PUBLIC tdfcore)

# region source set
set(SRC_SET
        src/renderer/tdf/tdf_render_manager.cc
        src/renderer/tdf/viewnode/net_image_loader.cc
        src/renderer/tdf/viewnode/scroll_view_node.cc
        src/renderer/tdf/viewnode/root_view_node.cc
        src/renderer/tdf/viewnode/embedded_view_node.cc
        src/renderer/tdf/viewnode/modal_view_node.cc
        src/renderer/tdf/viewnode/refresh_wrapper_node.cc
        src/renderer/tdf/viewnode/image_view_node.cc
        src/renderer/tdf/viewnode/text_input_node.cc
        src/renderer/tdf/viewnode/view_pager_node.cc
        src/renderer/tdf/viewnode/list_view_node.cc
        src/renderer/tdf/viewnode/text_view_node.cc
        src/renderer/tdf/viewnode/node_attributes_parser.cc
        src/renderer/tdf/viewnode/base64_image_loader.cc
        src/renderer/tdf/viewnode/view_node.cc
        src/renderer/tdf/view/modal_view.cc
        src/renderer/tdf/view/view_pager.cc
        )
target_sources(${PROJECT_NAME} PRIVATE ${SRC_SET})


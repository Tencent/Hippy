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

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC ${PROJECT_ROOT_DIR}/renderer/tdf/common/include)
target_compile_definitions(${PROJECT_NAME} INTERFACE "ENABLE_TDF_RENDER")
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

# region vfs
GlobalPackages_Add(vfs)
target_link_libraries(${PROJECT_NAME} PUBLIC vfs)
# endregion

# region tdfcore
# Consider iOS intergration in the future
if (ANDROID)
  set (TDFCORE_LIB_NAME "android-${ANDROID_ARCH_NAME}.zip")
elseif (IOS)
  message(FATAL_ERROR "unsupport platform")
endif()
InfraPackage_Add(TDF
  REMOTE "renderer/tdf/third_party/tdfcore/${TDF_CORE_VERSION}/${TDFCORE_LIB_NAME}"
  LOCAL "${PROJECT_ROOT_DIR}/third_party/tdfcore")
target_link_libraries(${PROJECT_NAME} PUBLIC tdf)
# endregion

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
        src/renderer/tdf/devtools/devtools_util.cc
        )
target_sources(${PROJECT_NAME} PRIVATE ${SRC_SET})
# endregion

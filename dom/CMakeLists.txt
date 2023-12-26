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

project("dom")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/.." REALPATH)

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
if (OHOS)
  GlobalPackages_Add_footstone()
else ()
  GlobalPackages_Add(footstone)
endif ()

target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region layout engine
if (NOT DEFINED LAYOUT_ENGINE)
  set(LAYOUT_ENGINE "Taitank")
endif ()

if ("${LAYOUT_ENGINE}" STREQUAL "Yoga")
  if (ANDROID)
    InfraPackage_Add(yoga
        REMOTE "dom/third_party/yoga/1.19.0/git-repo.tgz"
        LOCAL "third_party/yoga"
    )
  else ()
    InfraPackage_Add(yoga
        REMOTE "dom/third_party/yoga_ohos/1.19.0/git-repo.tgz"
        LOCAL "third_party/yoga"
    )
  endif ()
  target_compile_definitions(${PROJECT_NAME} PRIVATE "USE_YOGA")
  target_link_libraries(${PROJECT_NAME} PRIVATE yogacore)
elseif ("${LAYOUT_ENGINE}" STREQUAL "Taitank")
  InfraPackage_Add(taitank
      REMOTE "dom/third_party/taitank/1.0.6/git-repo.tar.gz"
      LOCAL "third_party/taitank"
      )
  target_link_libraries(${PROJECT_NAME} PRIVATE taitank)
else ()
  message(FATAL_ERROR "Layout Engine ${LAYOUT_ENGINE} is not supported")
endif ()
# endregion

# region source set
set(SOURCE_SET
    src/dom/animation/animation.cc
    src/dom/animation/animation_manager.cc
    src/dom/animation/animation_math.cc
    src/dom/animation/animation_set.cc
    src/dom/animation/cubic_bezier_animation.cc
    src/dom/tools/tools.cc
    src/dom/diff_utils.cc
    src/dom/dom_argument.cc
    src/dom/dom_event.cc
    src/dom/dom_listener.cc
    src/dom/dom_manager.cc
    src/dom/dom_node.cc
    src/dom/layer_optimized_render_manager.cc
    src/dom/layout_node.cc
    src/dom/root_node.cc
    src/dom/scene.cc
    src/dom/scene_builder.cc)
if (${LAYOUT_ENGINE} STREQUAL "Yoga")
  list(APPEND SOURCE_SET src/dom/yoga_layout_node.cc)
elseif (${LAYOUT_ENGINE} STREQUAL "Taitank")
  list(APPEND SOURCE_SET src/dom/taitank_layout_node.cc)
endif ()
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

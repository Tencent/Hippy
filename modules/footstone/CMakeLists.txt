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

cmake_minimum_required(VERSION 3.0)

project(footstone)

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

set(FOOTSTONE_PATH ${CMAKE_CURRENT_SOURCE_DIR})
set(THIRD_PARTY ${CMAKE_CURRENT_SOURCE_DIR}/third_party)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
# endregion

# region source set
set(SOURCE_SET
    src/base_timer.cc
    src/deserializer.cc
    src/hippy_value.cc
    src/idle_task.cc
    src/idle_timer.cc
    src/log_settings.cc
    src/log_settings_state.cc
    src/one_shot_timer.cc
    src/repeating_timer.cc
    src/serializer.cc
    src/task.cc
    src/task_runner.cc
    src/thread_worker.cc
    src/unicode_string_view.cc
    src/worker.cc
    src/worker_manager.cc)
if (ANDROID)
  list(APPEND SOURCE_SET
      src/platform/adr/logging.cc
      src/platform/adr/loop_worker_impl.cc
      src/platform/adr/thread_worker_impl.cc)
elseif (IOS)
  list(APPEND SOURCE_SET
      src/platform/ios/logging.cc
      src/platform/ios/loop_worker_impl.cc
      src/platform/ios/thread_worker_impl.cc)
else()
  message(FATAL_ERROR “Unsupported platform ${CMAKE_SYSTEM_NAME}”)
endif ()
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

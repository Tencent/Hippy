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

cmake_minimum_required(VERSION 3.13)

project(footstone)

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME}
    PUBLIC include
    PRIVATE .)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
if (ANDROID)
  target_link_libraries(${PROJECT_NAME} PRIVATE log)
endif()
# endregion

# region source set
set(SOURCE_SET
    src/base_timer.cc
    src/cv_driver.cc
    src/deserializer.cc
    src/hippy_value.cc
    src/idle_task.cc
    src/idle_timer.cc
    src/log_settings.cc
    src/log_settings_state.cc
    src/one_shot_timer.cc
    src/repeating_timer.cc
    src/serializer.cc
    src/string_utils.cc
    src/task.cc
    src/task_runner.cc
    src/string_view.cc
    src/worker.cc
    src/worker_manager.cc)
if (ANDROID)
  list(APPEND SOURCE_SET
      src/platform/adr/looper_driver.cc
      src/platform/adr/logging.cc
      src/platform/adr/worker_impl.cc)
elseif (IOS)
  list(APPEND SOURCE_SET
      src/platform/ios/looper_driver.cc
      src/platform/ios/logging.cc
      src/platform/ios/worker_impl.cc)
elseif (OHOS)
  list(APPEND SOURCE_SET
      src/platform/ohos/logging.cc
      src/platform/ohos/worker_impl.cc)
else ()
  message(FATAL_ERROR “Unsupported platform ${CMAKE_SYSTEM_NAME}”)
endif ()

set(PUBLIC_HEADER_SET
    include/footstone/task.h
    include/footstone/idle_task.h
    include/footstone/string_utils.h
    include/footstone/string_view_utils.h
    include/footstone/platform
    include/footstone/deserializer.h
    include/footstone/cv_driver.h
    include/footstone/driver.h
    include/footstone/logging.h
    include/footstone/worker.h
    include/footstone/one_shot_timer.h
    include/footstone/task_runner.h
    include/footstone/serializer.h
    include/footstone/hippy_value.h
    include/footstone/log_level.h
    include/footstone/macros.h
    include/footstone/check.h
    include/footstone/time_point.h
    include/footstone/repeating_timer.h
    include/footstone/base_time.h
    include/footstone/worker_impl.h
    include/footstone/log_settings.h
    include/footstone/persistent_object_map.h
    include/footstone/time_delta.h
    include/footstone/idle_timer.h
    include/footstone/hash.h
    include/footstone/string_view.h
    include/footstone/base_timer.h
    include/footstone/worker_manager.h)

if (ANDROID)
  list(APPEND PUBLIC_HEADER_SET
      include/footstone/platform/adr/looper_driver.h)
elseif (IOS)
  list(APPEND PUBLIC_HEADER_SET
      include/footstone/platform/ios/looper_driver.h)
elseif (OHOS)
else ()
  message(FATAL_ERROR “Unsupported platform ${CMAKE_SYSTEM_NAME}”)
endif ()

target_sources(${PROJECT_NAME}
    PRIVATE ${SOURCE_SET}
    PUBLIC ${PUBLIC_HEADER_SET})
# endregion

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
cmake_minimum_required(VERSION 3.5.0)
project(demo)

set(DEMO_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../")
set(PROJECT_ROOT_DIR "${DEMO_ROOT_DIR}/../../../")
set(HIPPY_ROOT_DIR "${PROJECT_ROOT_DIR}/framework/ohos/")
set(HIPPY_IMPL_CPP_DIR "${HIPPY_ROOT_DIR}/src/main/cpp/impl")

add_library(demo SHARED
  napi_init.cpp
  biz_view_manager.cpp
)

add_subdirectory("${HIPPY_IMPL_CPP_DIR}" ./hippy_impl)

target_link_libraries(demo PUBLIC
  hippy_impl
  libace_napi.z.so
  libace_ndk.z.so)

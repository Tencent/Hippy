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

# 示例一：
# 对于需要源码依赖 Hippy c++ 代码的特别需求，需要做2点：
# 1 集成 Hippy c++ 源码，生成使用方自己的 so，类似下面配置。
# 2 Hippy 内部不再编译 hippy so，注释掉 Hippy/framework/ohos/src/main/cpp/CMakeLists.txt 里内容。

#[[
project(hippy)
cmake_minimum_required(VERSION 3.14)

set(DEMO_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../")
set(PROJECT_ROOT_DIR "${DEMO_ROOT_DIR}/../../../")
set(HIPPY_ROOT_DIR "${PROJECT_ROOT_DIR}/framework/ohos/")
set(HIPPY_IMPL_CPP_DIR "${HIPPY_ROOT_DIR}/src/main/cpp/impl")

add_subdirectory("${HIPPY_IMPL_CPP_DIR}" ./hippy_impl)

add_library(hippy SHARED

)

target_link_libraries(hippy PUBLIC hippy_impl)

set(SOURCE_SET
  hippy_extend/src/example_view_a.cc
  hippy_extend/src/example_view_b.cc
  )
set(PUBLIC_SOURCE_SET
  hippy_extend/src/example_view_provider.cc
  )
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET} PUBLIC ${PUBLIC_SOURCE_SET})

#]]


# 示例二：
# 下面是监听Hippy组件设置非内部属性的例子（外部判断是否自己关心的属性，用来处理上报等）：

project(hippy_ex)
cmake_minimum_required(VERSION 3.14)

add_library(${PROJECT_NAME} SHARED)

set(PUBLIC_SOURCE_SET
  hippy_extend/src/example_external_prop_handler.cc
  )
target_sources(${PROJECT_NAME} PUBLIC ${PUBLIC_SOURCE_SET})

find_package(hippy)
target_link_libraries(${PROJECT_NAME} PUBLIC hippy::hippy libhilog_ndk.z.so)

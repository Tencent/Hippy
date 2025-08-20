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

project("hippy_impl")

add_compile_options("-Wno-unused-command-line-argument")

set(HIPPY_IMPL_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(HIPPY_ROOT_DIR "${HIPPY_IMPL_CPP_DIR}/../../../../")
set(PROJECT_ROOT_DIR "${HIPPY_ROOT_DIR}/../../")

set(HIPPY_FOOTSTONE_CPP_DIR "${PROJECT_ROOT_DIR}/modules/footstone")
set(HIPPY_OH_NAPI_CPP_DIR "${PROJECT_ROOT_DIR}/modules/ohos/oh_napi")
set(HIPPY_DRIVER_JS_CPP_DIR "${PROJECT_ROOT_DIR}/driver/js")
set(HIPPY_DOM_CPP_DIR "${PROJECT_ROOT_DIR}/dom")
set(HIPPY_VFS_CPP_DIR "${PROJECT_ROOT_DIR}/modules/vfs")

add_library(hippy_impl STATIC
  "${HIPPY_IMPL_CPP_DIR}/entry.cc"
)

target_include_directories(hippy_impl PUBLIC
  "${HIPPY_IMPL_CPP_DIR}"
)

add_subdirectory("${HIPPY_FOOTSTONE_CPP_DIR}" ./footstone)
add_subdirectory("${HIPPY_OH_NAPI_CPP_DIR}" ./oh_napi)
#add_subdirectory("${HIPPY_DRIVER_JS_CPP_DIR}" ./driver_js)
add_subdirectory("${HIPPY_DOM_CPP_DIR}" ./dom)
#add_subdirectory("${HIPPY_VFS_CPP_DIR}" ./vfs)
add_subdirectory("./connector")

#add_subdirectory("./napi")

target_link_libraries(hippy_impl PUBLIC
  libace_napi.z.so
  libace_ndk.z.so
  libhilog_ndk.z.so
  librawfile.z.so
  libnative_drawing.so
  libjsvm.so
  libnative_display_soloist.so
  libohfileuri.so
  libimage_source.so
  libpixelmap.so
  uv
  footstone
  oh_napi
  js_driver
  dom
  vfs
  connector
  devtools_integration
)

target_compile_options(hippy_impl PUBLIC ${hippy_compile_options} -std=gnu++17)

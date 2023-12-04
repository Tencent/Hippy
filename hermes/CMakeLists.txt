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

project(hermes)

add_library(${PROJECT_NAME} INTERFACE)
target_include_directories(${PROJECT_NAME} INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/include")

#import jsi
add_library(jsi_library SHARED IMPORTED)
if(CMAKE_SYSTEM_PROCESSOR STREQUAL "aarch64")
  set_property(TARGET jsi_library PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/lib/arm64-v8a/libjsi.so")
elseif(CMAKE_SYSTEM_PROCESSOR STREQUAL "armv7")
  set_property(TARGET jsi_library PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/lib/armeabi-v7a/libjsi.so")
endif()
target_link_libraries(${PROJECT_NAME} INTERFACE jsi_library)

#import fbjni
add_library(fbjni_library SHARED IMPORTED)
if(CMAKE_SYSTEM_PROCESSOR STREQUAL "aarch64")
  set_property(TARGET fbjni_library PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/lib/arm64-v8a/libfbjni.so")
elseif(CMAKE_SYSTEM_PROCESSOR STREQUAL "armv7")
  set_property(TARGET fbjni_library PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/lib/armeabi-v7a/libfbjni.so")
endif()
target_link_libraries(${PROJECT_NAME} INTERFACE fbjni_library)

#import hermes
add_library(hermes_library SHARED IMPORTED)
if(CMAKE_SYSTEM_PROCESSOR STREQUAL "aarch64")
  set_property(TARGET hermes_library PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/lib/arm64-v8a/libhermes.so")
elseif(CMAKE_SYSTEM_PROCESSOR STREQUAL "armv7")
  set_property(TARGET hermes_library PROPERTY IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/lib/armeabi-v7a/libhermes.so")
endif()
target_link_libraries(${PROJECT_NAME} INTERFACE hermes_library)

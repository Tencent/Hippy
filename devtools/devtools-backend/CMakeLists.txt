#[[
  Tencent is pleased to support the open source community by making
  Hippy available.

  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
  All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
]]

cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_VERBOSE_MAKEFILE on)
set(PROJECT_NAME devtools_backend)
project(${PROJECT_NAME})
message("make devtools_backend")

set(ABI_COMPILE_OPTIONS -fexceptions -Wno-error -frtti)
add_compile_options(${ABI_COMPILE_OPTIONS})

get_filename_component(DEVTOOLS_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/" REALPATH)
set(BACKEND_INCLUDE_DIR ${DEVTOOLS_ROOT_PATH}/include)
set(THIRD_PARTY_INCLUDE ${DEVTOOLS_ROOT_PATH}/third_party/socket/include)
message("DEVTOOLS_ROOT_PATH : ${DEVTOOLS_ROOT_PATH}")

# add include directories
include_directories(${BACKEND_INCLUDE_DIR} ${THIRD_PARTY_INCLUDE})

set(WEBSOCKETPP_PATH ${DEVTOOLS_ROOT_PATH}/third_party/websocketpp)
set(ASIO_PATH ${DEVTOOLS_ROOT_PATH}/third_party/asio/include)
include_directories(${WEBSOCKETPP_PATH} ${ASIO_PATH})

# add library
file(GLOB_RECURSE DEVTOOLS_SRC
        ${DEVTOOLS_ROOT_PATH}/src/**
        ${DEVTOOLS_ROOT_PATH}/third_party/socket/src/**)

if(IOS)
  add_definitions(-DOS_IOS)
endif()

if(ANDROID OR IOS)
  add_library(${PROJECT_NAME} ${DEVTOOLS_SRC})
elseif (APPLE)
  add_subdirectory("${DEVTOOLS_ROOT_PATH}/test" unit_test)
endif()

target_include_directories(${PROJECT_NAME} PUBLIC ${DEVTOOLS_ROOT_PATH}/third_party/nlohmann)

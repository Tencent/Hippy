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

cmake_minimum_required(VERSION 3.14)

project("devtools_backend")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 17)

get_filename_component(DEVTOOLS_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/" REALPATH)
get_filename_component(THIRD_PARTY_PATH "${CMAKE_CURRENT_SOURCE_DIR}/third_party/" REALPATH)
set(BACKEND_INCLUDE_DIR ${DEVTOOLS_ROOT_PATH}/include)
message("DEVTOOLS_ROOT_PATH : ${DEVTOOLS_ROOT_PATH}")

# add include directories
include_directories(${BACKEND_INCLUDE_DIR})

include(FetchContent)
# FetchContent asio
FetchContent_Declare(asio URL https://github.com/chriskohlhoff/asio/archive/refs/tags/asio-1-22-1.tar.gz)
FetchContent_GetProperties(asio)
if(NOT asio_POPULATED)
  FetchContent_Populate(asio)
  include_directories(${asio_SOURCE_DIR}/asio/include)
endif()

# FetchContent websocketpp
FetchContent_Declare(
        websocketpp
        GIT_REPOSITORY https://github.com/zaphoyd/websocketpp.git
        GIT_TAG b9aeec6eaf3d5610503439b4fae3581d9aff08e8 # branch origin/develop
        GIT_SHALLOW TRUE
)
FetchContent_GetProperties(websocketpp)
if(NOT websocketpp_POPULATED)
  FetchContent_Populate(websocketpp)
  include_directories(${websocketpp_SOURCE_DIR})
endif()

# add library
file(GLOB_RECURSE DEVTOOLS_SRC
        ${DEVTOOLS_ROOT_PATH}/src/**
        ${DEVTOOLS_ROOT_PATH}/third_party/socket/src/**)

# asio no rtti
add_definitions("-DASIO_NO_TYPEID")

# asio noexception
add_definitions("-DASIO_NO_EXCEPTIONS")

# json noexception
add_definitions("-DJSON_NOEXCEPTION")

# websocketpp noexception
add_definitions("-D_WEBSOCKETPP_NO_EXCEPTIONS_")

if(IOS)
  add_definitions("-DIOS")
endif()

if(ANDROID OR IOS)
  add_library(${PROJECT_NAME} ${DEVTOOLS_SRC})
elseif (APPLE)
  add_subdirectory("${DEVTOOLS_ROOT_PATH}/test" unit_test)
endif()

# FetchContent nlohmann_json
FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.10.5/json.tar.xz)
FetchContent_MakeAvailable(json)
target_link_libraries(${PROJECT_NAME} PUBLIC nlohmann_json::nlohmann_json)

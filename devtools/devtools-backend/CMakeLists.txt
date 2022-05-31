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

include("../../build/cmake/InfraPackagesModule.cmake")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 17)

get_filename_component(DEVTOOLS_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/" REALPATH)
set(BACKEND_INCLUDE_DIR ${DEVTOOLS_ROOT_PATH}/include)
message("DEVTOOLS_ROOT_PATH : ${DEVTOOLS_ROOT_PATH}")

# add include directories
include_directories(${BACKEND_INCLUDE_DIR})

# InfaPackage asio
InfaPackage_Add(asio
  REMOTE "devtools/backend/third_party/asio/1.22.1/asio.tar.gz"
  LOCAL "third_party/asio"
)
include_directories(${asio_SOURCE_DIR}/asio/include)

# InfaPackage websocketpp
InfaPackage_Add(websocketpp
  REMOTE "devtools/backend/third_party/websocketpp/develop/git-repo.tgz"
  LOCAL "third_party/websocketpp"
)
include_directories(${websocketpp_SOURCE_DIR})

# add library
file(GLOB_RECURSE DEVTOOLS_SRC
        ${DEVTOOLS_ROOT_PATH}/src/**
        ${DEVTOOLS_ROOT_PATH}/third_party/socket/src/**)

# asio no rtti
add_definitions("-DASIO_NO_TYPEID")

# asio noexception
add_definitions("-DASIO_NO_EXCEPTIONS")

add_definitions("-DASIO_DISABLE_ALIGNOF")

# json noexception
add_definitions("-DJSON_NOEXCEPTION")

# websocketpp noexception
add_definitions("-D_WEBSOCKETPP_NO_EXCEPTIONS_")

if(IOS)
  add_definitions("-DIOS")
endif()

if(ANDROID OR IOS)
  add_library(${PROJECT_NAME} ${DEVTOOLS_SRC})
endif()

# InfaPackage nlohmann_json
InfaPackage_Add(json
  REMOTE "devtools/backend/third_party/json/3.10.5/json.tar.xz"
  LOCAL "third_party/json"
)

target_link_libraries(${PROJECT_NAME} PUBLIC nlohmann_json::nlohmann_json)

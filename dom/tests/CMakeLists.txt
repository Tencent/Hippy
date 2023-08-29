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

project("dom_test")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/InfraPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region executable
add_executable(${PROJECT_NAME})
add_compile_definitions(${PROJECT_NAME} PRIVATE HIPPY_TEST)
# endregion

# region gtest
InfraPackage_Add(gtest
  REMOTE "test/third_party/googletest/release-1.11.0/googletest.release-1.11.0.tgz"
  LOCAL "third_party/googletest"
)
target_link_libraries(${PROJECT_NAME} PRIVATE gtest_main)
# endregion

# region nlohmann_json
InfraPackage_Add(json
  REMOTE "devtools/backend/third_party/json/3.10.5/json.tar.xz"
  LOCAL "third_party/json"
)
target_link_libraries(${PROJECT_NAME} PRIVATE nlohmann_json::nlohmann_json)
# endregion

# region footstone
GlobalPackages_Add(footstone)
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region dom
GlobalPackages_Add(dom)
target_link_libraries(${PROJECT_NAME} PRIVATE dom)
# endregion

# region source set
get_filename_component(ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/.." REALPATH)
set(SOURCE_SET
		${ROOT_DIR}/tests/main.cc
		src/dom/deserializer_unittests.cc
		src/dom/dom_manager_unittests.cc
		src/dom/hippy_value_unittests.cc
		src/dom/serializer_unittests.cc)
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

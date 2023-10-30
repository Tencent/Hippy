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

include_directories(${PROJECT_ROOT_DIR}/hermes/include)

## hermes
add_library(hermes SHARED IMPORTED)
set_target_properties(hermes
        PROPERTIES
        IMPORTED_LOCATION
        ${PROJECT_ROOT_DIR}/hermes/lib/arm64-v8a/libhermes.so)

## jsi
add_library(jsi SHARED IMPORTED)
set_target_properties(jsi
        PROPERTIES
        IMPORTED_LOCATION
        ${PROJECT_ROOT_DIR}/hermes/lib/arm64-v8a/libjsi.so)


# add_library(${PROJECT_NAME} INTERFACE)
# target_include_directories(${PROJECT_NAME}
#   INTERFACE "${CMAKE_CURRENT_SOURCE_DIR}/include"
# )

# #TODO(charleeshen): move to hip
# macro(AddLinkLibrary name)
#   set(LIB_NAME "${PROJECT_NAME}_${name}")
#   add_library(${LIB_NAME} STATIC IMPORTED)
#   set_property(TARGET ${LIB_NAME} PROPERTY
#     IMPORTED_LOCATION "${PROJECT_SOURCE_DIR}/hermes/lib/arm64-v8a/lib${name}.so")
#   target_link_libraries(${PROJECT_NAME}
#     INTERFACE ${LIB_NAME})
# endmacro()

# AddLinkLibrary(hermes)
# AddLinkLibrary(jsi)

# target_link_libraries(hermes INTERFACE )

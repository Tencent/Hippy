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

include("${CMAKE_CURRENT_LIST_DIR}/InfraPackagesModule.cmake")

function(GlobalPackages_Add_v8)
  if (NOT TARGET v8)
    if (NOT V8_COMPONENT)
      message(FATAL_ERROR "The V8_COMPONENT variable must be set")
    endif ()
    if ("${CMAKE_SYSTEM_NAME}" STREQUAL "Android")
      set(V8_REMOTE_FILENAME "android-${ANDROID_ARCH_NAME}.tgz")
    elseif ("${CMAKE_SYSTEM_NAME}" STREQUAL "Windows")
      set(V8_REMOTE_FILENAME "windows-${ANDROID_ARCH_NAME}.zip")
    elseif ("${CMAKE_SYSTEM_NAME}" STREQUAL "Darwin")
      set(V8_REMOTE_FILENAME "macos-${ANDROID_ARCH_NAME}.tgz")
    else ()
      message(FATAL_ERROR "Unsupported system ${CMAKE_SYSTEM_NAME}")
    endif ()

    InfraPackage_Add(V8
        REMOTE "global_packages/v8/${V8_COMPONENT}/${V8_REMOTE_FILENAME}"
        LOCAL "${V8_COMPONENT}")

    get_target_property(V8_AUX_DEPS v8 INTERFACE_V8_AUX_DEPS)
    if (V8_AUX_DEPS)
      foreach (__item IN LISTS V8_AUX_DEPS)
        add_custom_command(
            TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E
            copy "${__item}" "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
      endforeach ()
    endif ()
  endif ()
endfunction()

function(GlobalPackages_Add_dom)
  if (NOT TARGET dom)
    InfraPackage_Add(DOM
        LOCAL "${CMAKE_CURRENT_LIST_DIR}/../../dom")
  endif ()
endfunction()

function(GlobalPackages_Add)
  foreach (packageName IN LISTS ARGN)
    cmake_language(CALL GlobalPackages_Add_${packageName})
  endforeach ()
endfunction()

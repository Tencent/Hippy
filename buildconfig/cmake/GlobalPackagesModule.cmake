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

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_LIST_DIR}/../.." REALPATH)

include("${CMAKE_CURRENT_LIST_DIR}/InfraPackagesModule.cmake")

function(GlobalPackages_Add_dom)
  if (NOT TARGET dom)
    InfraPackage_Add(DOM
        LOCAL "${PROJECT_ROOT_DIR}/dom")
  endif ()
endfunction()

function(GlobalPackages_Add_footstone)
  if (NOT TARGET footstone)
    InfraPackage_Add(FOOTSTONE
        LOCAL "${PROJECT_ROOT_DIR}/modules/footstone")
  endif()
endfunction()

function(GlobalPackages_Add_jni)
  if (NOT TARGET jni)
    InfraPackage_Add(JNI
            LOCAL "${PROJECT_ROOT_DIR}/modules/android/jni")
  endif()
endfunction()

function(GlobalPackages_Add_oh_napi)
  if (NOT TARGET oh_napi)
    InfraPackage_Add(OH_NAPI
            LOCAL "${PROJECT_ROOT_DIR}/modules/ohos/oh_napi")
  endif()
endfunction()

function(GlobalPackages_Add_vfs)
  if (NOT TARGET vfs)
    InfraPackage_Add(VFS
            LOCAL "${PROJECT_ROOT_DIR}/modules/vfs")
  endif()
endfunction()

function(GlobalPackages_Add_devtools_backend)
  if (NOT TARGET devtools_backend)
    InfraPackage_Add(DEVTOOLS_BACKEND
            LOCAL "${PROJECT_ROOT_DIR}/devtools/devtools-backend")
  endif ()
endfunction()

function(GlobalPackages_Add_devtools_integration)
  if (NOT TARGET devtools_integration)
    InfraPackage_Add(DEVTOOLS_INTEGRATION
            LOCAL "${PROJECT_ROOT_DIR}/devtools/devtools-integration")
  endif()
endfunction()

function(GlobalPackages_Add)
  foreach (packageName IN LISTS ARGN)
    cmake_language(CALL GlobalPackages_Add_${packageName})
  endforeach ()
endfunction()

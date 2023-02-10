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

include(FetchContent)

if (NOT DEFINED INFA_PACKAGES_URL)
  if (DEFINED ENV{CMAKE_INFA_PACKAGES_URL})
    set(INFA_PACKAGES_URL "$ENV{CMAKE_INFA_PACKAGES_URL}")
  else()
    set(INFA_PACKAGES_URL "https://infra-packages.openhippy.com")
  endif()
endif ()
if (NOT DEFINED DEFAULT_INFA_DOMAIN)
  set(DEFAULT_INFA_DOMAIN "hippy")
endif ()

macro(InfraPackage_Add packageName)
  string(TOLOWER ${ARGV0} packageNameLower)
  if ("${packageNameLower}" STREQUAL "")
    message(FATAL_ERROR "Empty packageName not allowed for InfaPackage_Add()")
  endif ()

  set(requiredValueArgs REMOTE LOCAL)
  set(optionalValueArgs REMOTE_HASH REMOTE_DOMAIN)

  set(options "")
  set(oneValueArgs ${requiredValueArgs} ${optionalValueArgs})
  set(multiValueArgs "")
  set(list_var "${ARGN}")
  cmake_parse_arguments(ARG
      "${options}" "${oneValueArgs}" "${multiValueArgs}" ${list_var})

  set(__return NO)
  if (ARG_LOCAL)
    set(ABSOLUTE_LOCAL_PATH "${ARG_LOCAL}")
    if (NOT IS_ABSOLUTE "${ABSOLUTE_LOCAL_PATH}")
      get_filename_component(ABSOLUTE_LOCAL_PATH "${ABSOLUTE_LOCAL_PATH}" ABSOLUTE)
    endif ()
    if (EXISTS "${ABSOLUTE_LOCAL_PATH}")
      # Pass variables back to the caller.
      set(${packageNameLower}_SOURCE_DIR ${ABSOLUTE_LOCAL_PATH})
      set(${packageNameLower}_BINARY_DIR "${CMAKE_BINARY_DIR}/infa_packages/${packageNameLower}")
      set(${contentNameLower}_POPULATED True)

      if (EXISTS "${ABSOLUTE_LOCAL_PATH}/CMakeLists.txt")
        add_subdirectory(${ABSOLUTE_LOCAL_PATH} ${${packageNameLower}_BINARY_DIR})
      endif ()
      set(__return YES)
    endif ()
  endif ()

  if (ARG_REMOTE AND NOT __return)
    if (NOT ARG_REMOTE_DOMAIN)
      set(ARG_REMOTE_DOMAIN ${DEFAULT_INFA_DOMAIN})
    endif ()

    # Prepare FetchContent_Declare() ARG
    set(FetchContent_Declare_ARG ${packageNameLower}
        URL "${INFA_PACKAGES_URL}/${ARG_REMOTE_DOMAIN}/${ARG_REMOTE}")
    if (ARG_REMOTE_HASH)
      list(APPEND FetchContent_Declare_ARG URL_HASH ${ARG_REMOTE_HASH})
    endif ()

    cmake_policy(PUSH)
    if (POLICY CMP0135)
      cmake_policy(SET CMP0135 NEW) # valid for DOWNLOAD_EXTRACT_TIMESTAMP option in CMake 3.24 and later
    endif ()
    FetchContent_Declare(${FetchContent_Declare_ARG})
    cmake_policy(POP)
    FetchContent_MakeAvailable(${packageNameLower})
    set(__return True)
  endif ()

  if (NOT __return)
    message(FATAL_ERROR "At least one of the REMOTE or LOCAL argument needs to be set when calling InfaPackage_Add()")
  endif ()
endmacro()

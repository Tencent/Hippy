#
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
#

set(VOLTRON_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(VOLTRON_CORE_SRC_DIR ${VOLTRON_CORE_DIR}/src)


set(VOLTRON_CORE_SRC_FILES
        ${VOLTRON_CORE_SRC_DIR}/bridge/bridge_define.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/bridge_ffi_impl.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/ffi_bridge_runtime.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/native_source_code_flutter.cc)

if ((CMAKE_SYSTEM_NAME STREQUAL "Android") OR (CMAKE_SYSTEM_NAME STREQUAL "Windows"))
    set(VOLTRON_CORE_SRC_FILES ${VOLTRON_CORE_SRC_FILES}
            ${VOLTRON_CORE_SRC_DIR}/bridge/android/bridge_impl.cc
            ${VOLTRON_CORE_SRC_DIR}/bridge/android/dart2js.cc
            ${VOLTRON_CORE_SRC_DIR}/bridge/android/exception_handler.cc
            ${VOLTRON_CORE_SRC_DIR}/bridge/android/js2dart.cc
            ${VOLTRON_CORE_SRC_DIR}/bridge/android/voltron_bridge.cc)
    include_directories(${VOLTRON_CORE_SRC_DIR}/bridge/android)

elseif ((CMAKE_SYSTEM_NAME STREQUAL "Darwin") OR (CMAKE_SYSTEM_NAME STREQUAL "iOS"))
    file(GLOB_RECURSE DARWIN_SRC_MM_FILES
            ${VOLTRON_CORE_SRC_DIR}/bridge/ios/*.mm)
    file(GLOB_RECURSE DARWIN_SRC_M_FILES
            ${VOLTRON_CORE_SRC_DIR}/bridge/ios/*.m)
    set(VOLTRON_CORE_SRC_FILES ${VOLTRON_CORE_SRC_FILES}
            ${DARWIN_SRC_MM_FILES}
            ${DARWIN_SRC_M_FILES}
            ${VOLTRON_CORE_DIR}/../VoltronCore/VoltronCore/VoltronCoreInterface.m)

    set(DARWIN_HEADERS ${DARWIN_HEADERS}
            ${DARWIN_HEADER_FILES}
            ${VOLTRON_CORE_DIR}/../VoltronCore/VoltronCore/VoltronCore.h
            ${VOLTRON_CORE_DIR}/../VoltronCore/VoltronCore/VoltronCoreInterface.h)
    include_directories(${VOLTRON_CORE_SRC_DIR}/bridge/ios)

endif ()

include_directories(${VOLTRON_CORE_DIR}/include)

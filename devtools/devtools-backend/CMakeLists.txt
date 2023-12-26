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

project("devtools_backend")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/InfraPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
target_compile_definitions(${PROJECT_NAME} INTERFACE "ENABLE_INSPECTOR")
if (IOS)
  target_compile_definitions(${PROJECT_NAME} PRIVATE "IOS")
endif ()
# endregion

# region vm
if ("${JS_ENGINE}" STREQUAL "V8")
  target_compile_definitions(${PROJECT_NAME} PRIVATE "JS_V8")
elseif ("${JS_ENGINE}" STREQUAL "JSC")
  target_compile_definitions(${PROJECT_NAME} PRIVATE "JS_JSC")
endif ()
# endregion

# region footstone
if (OHOS)
  GlobalPackages_Add_footstone()
else ()
  GlobalPackages_Add(footstone)
endif ()
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region asio
InfraPackage_Add(asio
    REMOTE "devtools/backend/third_party/asio/1.22.1/asio.tar.gz"
    LOCAL "third_party/asio")
target_compile_definitions(${PROJECT_NAME}
    # no rtti
    PRIVATE "ASIO_NO_TYPEID"
    # no exception
    PRIVATE "ASIO_NO_EXCEPTIONS"
    PRIVATE "ASIO_DISABLE_ALIGNOF")
target_include_directories(${PROJECT_NAME} PRIVATE ${asio_SOURCE_DIR}/asio/include)
# endregion

# region websocketpp
InfraPackage_Add(websocketpp
    REMOTE "devtools/backend/third_party/websocketpp/develop/git-repo.tgz"
    LOCAL "third_party/websocketpp")
add_compile_definitions(
    # no exception
    "_WEBSOCKETPP_NO_EXCEPTIONS_")
target_include_directories(${PROJECT_NAME} PRIVATE ${websocketpp_SOURCE_DIR})
# websocketpp/base64/base64.hpp has some implicit conversion warnings currently
target_compile_options(${PROJECT_NAME} PRIVATE -Wno-error)
# endregion

# region nlohmann_json
if (IOS)
  # nlohmann_json 3.10.0 or later failed to compile on iOS
  InfraPackage_Add(json
          REMOTE "devtools/backend/third_party/json/3.10.5/json.tar.xz"
          LOCAL "third_party/json")
  target_include_directories(${PROJECT_NAME} PUBLIC ${json_SOURCE_DIR}/single_include)
else()
  # nlohmann_json 3.9.1 failed to compile on Android，throw has not been changed completely
  InfraPackage_Add(json
          REMOTE "devtools/backend/third_party/json/3.10.5/json.tar.xz"
          LOCAL "third_party/json")
  target_link_libraries(${PROJECT_NAME} PUBLIC nlohmann_json::nlohmann_json)
endif()

add_compile_definitions(
    # no exception
    "JSON_NOEXCEPTION")
# endregion

# region source set
set(SOURCE_SET
    src/api/adapter/data/domain_metas.cc
    src/api/adapter/data/dom_node_location.cc
    src/api/adapter/data/dom_node_metas.cc
    src/api/adapter/data/frame_timing_metas.cc
    src/api/adapter/data/memory_metas.cc
    src/api/adapter/data/render_diagnostic_metas.cc
    src/api/adapter/data/render_node_metas.cc
    src/api/adapter/data/trace_event_metas.cc
    src/api/adapter/data/dom_push_node_path_metas.cc
    src/api/devtools_backend_service.cc
    src/api/notification/data/devtools_http_loading_finished.cc
    src/api/notification/data/devtools_http_request.cc
    src/api/notification/data/devtools_http_response.cc
    src/api/notification/default/default_log_notification.cc
    src/api/notification/default/default_network_notification.cc
    src/api/notification/default/default_runtime_notification.cc
    src/module/domain/base_domain.cc
    src/module/domain/css_domain.cc
    src/module/domain/dom_domain.cc
    src/module/domain/network_domain.cc
    src/module/domain/page_domain.cc
    src/module/domain/tdf_common_protocol_domain.cc
    src/module/domain/tdf_inspector_domain.cc
    src/module/domain/tdf_memory_domain.cc
    src/module/domain/tdf_performance_domain.cc
    src/module/domain/tdf_runtime_domain.cc
    src/module/domain/tracing_domain.cc
    src/module/domain_dispatch.cc
    src/module/model/css_model.cc
    src/module/model/dom_model.cc
    src/module/model/frame_poll_model.cc
    src/module/model/screen_shot_model.cc
    src/module/model/screen_shot_response.cc
    src/module/request/css_edit_style_texts_request.cc
    src/module/request/css_node_data_request.cc
    src/module/request/dom_node_data_request.cc
    src/module/request/dom_node_for_location_request.cc
    src/module/request/network_response_body_request.cc
    src/module/request/screen_shot_request.cc
    src/module/request/selected_render_object_request.cc
    src/module/request/dom_push_nodes_request.cc
    src/module/request/dom_push_node_by_path_request.cc
    src/tunnel/net_channel.cc
    src/tunnel/tcp/frame_codec.cc
    src/tunnel/tcp/tcp_channel.cc
    src/tunnel/tunnel_service.cc
    src/tunnel/ws/web_socket_channel.cc
    src/tunnel/tcp/socket.cc)
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion

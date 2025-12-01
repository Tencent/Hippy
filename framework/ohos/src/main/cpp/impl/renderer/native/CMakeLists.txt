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

project("native_renderer")

set(CPP_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(HIPPY_ROOT_DIR "${CPP_ROOT_DIR}/../../../../../../")
set(PROJECT_ROOT_DIR "${HIPPY_ROOT_DIR}/../../")

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
#target_compile_definitions(${PROJECT_NAME} INTERFACE "OHOS_NATIVE_RENDER")
# endregion

# 鸿蒙上文本组件绘制方案：
# OHOS_DRAW_TEXT - 使用绘制好的文本赋给Text组件，默认打开
# OHOS_DRAW_CUSTOM_TEXT - 使用绘制好的文本赋给Custom组件，不使用Text组件，AI选词、长按、手势、无障碍等不能利用OH底座，
# 也打开，否则有TxtParagraph偶现crash。TODO：TxtParagraph crash
target_compile_definitions(${PROJECT_NAME} PUBLIC "OHOS_DRAW_TEXT")
target_compile_definitions(${PROJECT_NAME} PUBLIC "OHOS_DRAW_CUSTOM_TEXT")

# region dom
GlobalPackages_Add_dom()
# Just reference the `dom` header files, no library needed
target_include_directories(${PROJECT_NAME} PRIVATE $<TARGET_PROPERTY:dom,INTERFACE_INCLUDE_DIRECTORIES>)
# endregion

# region footstone
GlobalPackages_Add_footstone()
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region napi
GlobalPackages_Add_oh_napi()
target_link_libraries(${PROJECT_NAME} PRIVATE oh_napi)
# endregion

# region vfs
GlobalPackages_Add_vfs()
target_link_libraries(${PROJECT_NAME} PRIVATE vfs)
# endregion

# region source set
set(SOURCE_SET
  src/native_render_manager.cc
  src/native_render_provider.cc
  src/native_render_provider_manager.cc
  src/native_render_impl.cc
  src/native_render_context.cc
  src/native_render_params.cc
  src/uimanager/hr_mutation.cc
  src/uimanager/hr_manager.cc
  src/uimanager/hr_view_manager.cc
  src/uimanager/hr_gesture_dispatcher.cc
  src/uimanager/hr_keyboard_manager.cc
  src/utils/hr_event_utils.cc
  src/utils/hr_convert_utils.cc
  src/utils/hr_device_utils.cc
  src/utils/hr_pixel_utils.cc
  src/utils/hr_text_convert_utils.cc
  src/utils/hr_url_utils.cc
  src/utils/hr_display_sync_utils.cc
  src/utils/hr_perf_utils.cc
  src/virtual/hr_virtual_view_manager.cc
  src/virtual/hr_virtual_view.cc
  src/arkui/arkui_node.cc
  src/arkui/arkui_node_registry.cc
  src/arkui/column_node.cc
  src/arkui/custom_node.cc
  src/arkui/custom_ts_node.cc
  src/arkui/image_node.cc
  src/arkui/image_span_node.cc
  src/arkui/list_item_node.cc
  src/arkui/list_node.cc
  src/arkui/native_dialog_api.cc
  src/arkui/native_gesture_api.cc
  src/arkui/native_node_api.cc
  src/arkui/refresh_node.cc
  src/arkui/row_node.cc
  src/arkui/scroll_node.cc
  src/arkui/span_node.cc
  src/arkui/stack_node.cc
  src/arkui/swiper_node.cc
  src/arkui/text_area_node.cc
  src/arkui/text_input_node.cc
  src/arkui/text_input_base_node.cc
  src/arkui/text_node.cc
  src/arkui/water_flow_node.cc
  src/arkui/water_flow_item_node.cc
  src/arkui/dialog_controller.cc
  src/components/hippy_render_view_creator.cc
  src/components/base_view.cc
  src/components/custom_ts_view.cc
  src/components/custom_view.cc
  src/components/div_view.cc
  src/components/image_base_view.cc
  src/components/image_nine_view.cc
  src/components/image_view.cc
  src/components/list_item_adapter.cc
  src/components/list_item_view.cc
  src/components/list_view.cc
  src/components/modal_view.cc
  src/components/pager_item_adapter.cc
  src/components/pager_item_view.cc
  src/components/pager_view.cc
  src/components/pull_footer_view.cc
  src/components/pull_header_view.cc
  src/components/refresh_wrapper_item_view.cc
  src/components/refresh_wrapper_view.cc
  src/components/rich_text_view.cc
  src/components/rich_text_span_view.cc
  src/components/rich_text_image_span_view.cc
  src/components/root_view.cc
  src/components/scroll_view.cc
  src/components/text_input_view.cc
  src/components/waterfall_item_view.cc
  src/components/waterfall_view.cc
  src/components/waterfall_pull_footer_view.cc
  src/components/waterfall_pull_header_view.cc
  src/components/extend/bidirection_list_view.cc
  src/image_loader/image_loader.cc
  src/recycle/recycle_view.cc
  src/text_measure/font_collection_manager.cc
  src/text_measure/text_measurer.cc
  src/text_measure/text_measure_manager.cc
  )
set(PUBLIC_SOURCE_SET
  src/native_render_provider_capi.cc
  src/native_render_provider_napi.cc
  src/api/hippy_view_provider.cc
  src/api/hippy.cc
  src/api/hr_any_data.cc
  src/api_c/hippy_c.cc
  )
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET} PUBLIC ${PUBLIC_SOURCE_SET})
# endregion

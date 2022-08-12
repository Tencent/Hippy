cmake_minimum_required(VERSION 3.15)
set(PROJECT_NAME "tencent_voltron_render")
project(${PROJECT_NAME} LANGUAGES CXX)
option(ENABLE_DEBUG "Enable curl for lighting." ON)
include(${CMAKE_CURRENT_LIST_DIR}/libs/thirdparty.cmake)

# This value is used when generating builds using this plugin, so it must
# not be changed
set(PLUGIN_NAME "tencent_voltron_render_plugin")

add_library(${PLUGIN_NAME} SHARED
  "tencent_voltron_render_plugin.cpp"
)

set(RENDER_CORE_LIB rendercore)
set(FLEX_BOX_LIB flexbox)

get_filename_component(RENDER_CORE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/RenderCore" REALPATH)
get_filename_component(FLEX_BOX_CORE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../core/third_party/layout/platform/windows" REALPATH)

message(FLEX_BOX_CORE_DIR : ${FLEX_BOX_CORE_DIR})

if(ENABLE_DEBUG)
   add_subdirectory(${RENDER_CORE_DIR})
   add_subdirectory(${FLEX_BOX_CORE_DIR} out)
endif(ENABLE_DEBUG)

apply_standard_settings(${PLUGIN_NAME})
set_target_properties(${PLUGIN_NAME} PROPERTIES
  CXX_VISIBILITY_PRESET hidden)
target_compile_definitions(${PLUGIN_NAME} PRIVATE FLUTTER_PLUGIN_IMPL)
target_include_directories(${PLUGIN_NAME} INTERFACE
  "${CMAKE_CURRENT_SOURCE_DIR}/include")
target_link_libraries(${PLUGIN_NAME} PRIVATE flutter flutter_wrapper_plugin "${CMAKE_CURRENT_SOURCE_DIR}/libs/rendercore/lib/rendercore.lib" "${CMAKE_CURRENT_SOURCE_DIR}/libs/flexbox/lib/flexbox.lib")

# List of absolute paths to libraries that should be bundled with the plugin
set(tencent_voltron_render_bundled_libraries
  ""
  PARENT_SCOPE
)

install(FILES "${EXTERNAL_DLLS}" DESTINATION "${CMAKE_INSTALL_PREFIX}"
  COMPONENT Runtime)

set(FRAMEWORK_CORE_DIR ${FRAMEWORK_DIR}/js/core)
set(FRAMEWORK_CORE_SRC_DIR ${FRAMEWORK_CORE_DIR}/src)
set(DEVTOOLS_DIR "${FRAMEWORK_DIR}../devtools/devtools-backend")

set(FRAMEWORK_CORE_SRC_FILES
        ${FRAMEWORK_CORE_SRC_DIR}/base/file.cc
        ${FRAMEWORK_CORE_SRC_DIR}/base/js_value_wrapper.cc
        ${FRAMEWORK_CORE_SRC_DIR}/base/task.cc
        ${FRAMEWORK_CORE_SRC_DIR}/base/task_runner.cc
        ${FRAMEWORK_CORE_SRC_DIR}/base/thread.cc
        ${FRAMEWORK_CORE_SRC_DIR}/base/thread_id.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/console_module.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/contextify_module.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/module_register.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/timer_module.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/scene_builder.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/event_module.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/animation_module.cc
        ${FRAMEWORK_CORE_SRC_DIR}/modules/ui_manager_module.cc
        ${FRAMEWORK_CORE_SRC_DIR}/napi/callback_info.cc
        ${FRAMEWORK_CORE_SRC_DIR}/napi/js_native_turbo.cc
        ${FRAMEWORK_CORE_SRC_DIR}/task/common_task.cc
        ${FRAMEWORK_CORE_SRC_DIR}/task/javascript_task.cc
        ${FRAMEWORK_CORE_SRC_DIR}/task/javascript_task_runner.cc
        ${FRAMEWORK_CORE_SRC_DIR}/task/worker_task_runner.cc
        ${FRAMEWORK_CORE_SRC_DIR}/engine.cc
        ${FRAMEWORK_CORE_SRC_DIR}/scope.cc)

if ((CMAKE_SYSTEM_NAME STREQUAL "Android") OR (CMAKE_SYSTEM_NAME STREQUAL "Windows"))
    set(FRAMEWORK_CORE_SRC_FILES ${FRAMEWORK_CORE_SRC_FILES}
            ${FRAMEWORK_CORE_SRC_DIR}/napi/v8/serializer.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/v8/js_native_api_v8.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/v8/js_native_turbo_v8.cc
            ${FRAMEWORK_CORE_SRC_DIR}/runtime/v8/v8_bridge_utils.cc
            ${FRAMEWORK_CORE_SRC_DIR}/runtime/v8/runtime.cc)
    if (DEFINED V8_WITHOUT_INSPECTOR)
      add_definitions("-DV8_WITHOUT_INSPECTOR")
    else()
      set(FRAMEWORK_CORE_SRC_FILES ${FRAMEWORK_CORE_SRC_FILES}
              ${FRAMEWORK_CORE_SRC_DIR}/runtime/v8/inspector/v8_channel_impl.cc
              ${FRAMEWORK_CORE_SRC_DIR}/runtime/v8/inspector/v8_inspector_client_impl.cc)
    endif()

else ()
    set(FRAMEWORK_CORE_SRC_FILES ${FRAMEWORK_CORE_SRC_FILES}
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_api_jsc.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_api_value_jsc.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_jsc_helper.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_turbo_jsc.cc)
endif ()

add_subdirectory(${FRAMEWORK_CORE_DIR}/third_party/base base)
set(FRAMEWORK_CORE_DEPS tdf_base tdf_base_common)

include_directories(${FRAMEWORK_CORE_DIR}/include)
include_directories(${FRAMEWORK_CORE_DIR}/third_party/base/include)

if (ENABLE_INSPECTOR STREQUAL "true")
  include("../../../../buildconfig/cmake/InfraPackagesModule.cmake")
  include("../../../../buildconfig/cmake/compiler_toolchain.cmake")
  message("framework_core.cmake DEVTOOLS_DIR:" ${DEVTOOLS_DIR})
  add_definitions("-DENABLE_INSPECTOR")
  include_directories(${DEVTOOLS_DIR}/include)
  InfraPackage_Add(json
          REMOTE "devtools/backend/third_party/json/3.10.5/json.tar.xz"
          LOCAL "third_party/json"
  )
  include_directories(${json_SOURCE_DIR}/single_include)
  set(FRAMEWORK_CORE_SRC_FILES ${FRAMEWORK_CORE_SRC_FILES}
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/devtools_data_source.cc
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/devtools_utils.cc
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/trace_control.cc
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/adapter/impl/hippy_dom_tree_adapter.cc
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/adapter/impl/hippy_elements_request_adapter.cc
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/adapter/impl/hippy_screen_adapter.cc
          ${FRAMEWORK_CORE_SRC_DIR}/devtools/adapter/impl/hippy_tracing_adapter.cc)
endif()


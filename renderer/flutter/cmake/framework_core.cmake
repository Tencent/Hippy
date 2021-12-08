set(FRAMEWORK_CORE_DIR ${FRAMEWORK_DIR}/js/core)
set(FRAMEWORK_CORE_SRC_DIR ${FRAMEWORK_CORE_DIR}/src)

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
            ${FRAMEWORK_CORE_SRC_DIR}/napi/v8/js_native_api_v8.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/v8/js_native_turbo_v8.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/v8/native_source_code_android.cc)

else ()
    set(FRAMEWORK_CORE_SRC_FILES ${FRAMEWORK_CORE_SRC_FILES}
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_api_jsc.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_api_value_jsc.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_jsc_helper.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/js_native_turbo_jsc.cc
            ${FRAMEWORK_CORE_SRC_DIR}/napi/jsc/native_source_code_ios.cc)
endif ()

add_subdirectory(${FRAMEWORK_CORE_DIR}/third_party/base base)
set(FRAMEWORK_CORE_DEPS tdf_base tdf_base_common)

include_directories(${FRAMEWORK_CORE_DIR}/include)
include_directories(${FRAMEWORK_CORE_DIR}/third_party/base/include)


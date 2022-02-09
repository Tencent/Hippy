set(VOLTRON_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(VOLTRON_CORE_SRC_DIR ${VOLTRON_CORE_DIR}/src)
set(RENDER_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../renderer/flutter/core)
set(RENDER_CORE_SRC_DIR ${RENDER_CORE_DIR}/src)
set(CODEC_DIR ${RENDER_CORE_DIR}/third_party/codec)
set(CODEC_SRC_DIR ${RENDER_CORE_DIR}/third_party/codec/src)


set(RENDER_CORE_SRC_FILES
        ${VOLTRON_CORE_SRC_DIR}/ffi/bridge_define.cc
        ${VOLTRON_CORE_SRC_DIR}/ffi/bridge_ffi_impl.cc
        ${VOLTRON_CORE_SRC_DIR}/ffi/callback_manager.cc
        ${VOLTRON_CORE_SRC_DIR}/ffi/ffi_platform_runtime.cc
        ${RENDER_CORE_SRC_DIR}/render/render_queue.cc
        ${RENDER_CORE_SRC_DIR}/render/render_task.cc
        ${RENDER_CORE_SRC_DIR}/render/render_task_runner.cc
        ${RENDER_CORE_SRC_DIR}/render/voltron_render_manager.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/bridge_manager.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/string_util.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/url.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/native_source_code_voltron.cc
        ${VOLTRON_CORE_SRC_DIR}/bridge/voltron_loader.cc
        ${CODEC_SRC_DIR}/standard_codec.cc)

if ((CMAKE_SYSTEM_NAME STREQUAL "Android") OR (CMAKE_SYSTEM_NAME STREQUAL "Windows"))
    set(RENDER_CORE_SRC_FILES ${RENDER_CORE_SRC_FILES}
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
    set(RENDER_CORE_SRC_FILES ${RENDER_CORE_SRC_FILES}
            ${DARWIN_SRC_MM_FILES}
            ${DARWIN_SRC_M_FILES}
            ${VOLTRON_CORE_DIR}/../RenderCore/RenderCore/RenderCoreInterface.m)

    file(GLOB_RECURSE DARWIN_HEADER_FILES
            ${RENDER_CORE_SRC_DIR}/bridge/ios/*.h)

    set(DARWIN_HEADERS ${DARWIN_HEADERS}
            ${DARWIN_HEADER_FILES}
            ${VOLTRON_CORE_DIR}/../RenderCore/RenderCore/RenderCore.h
            ${VOLTRON_CORE_DIR}/../RenderCore/RenderCore/RenderCoreInterface.h)
    include_directories(${VOLTRON_CORE_SRC_DIR}/bridge/ios)

endif ()

include_directories(${RENDER_CORE_DIR}/third_party/codec/include)
include_directories(${VOLTRON_CORE_DIR}/include)
include_directories(${RENDER_CORE_DIR}/include)

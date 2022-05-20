set(VOLTRON_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(VOLTRON_CORE_SRC_DIR ${VOLTRON_CORE_DIR}/src)


set(VOLTRON_CORE_SRC_FILES
        ${VOLTRON_CORE_SRC_DIR}/ffi/bridge_define.cc
        ${VOLTRON_CORE_SRC_DIR}/ffi/bridge_ffi_impl.cc
        ${VOLTRON_CORE_SRC_DIR}/ffi/ffi_bridge_runtime.cc
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

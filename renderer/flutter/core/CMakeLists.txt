set(LIB_NAME "render_core")

project(render_core)

set(RENDER_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(RENDER_CORE_SRC_DIR ${RENDER_CORE_DIR}/src)
set(CODEC_DIR ${RENDER_CORE_DIR}/third_party/codec)
set(CODEC_SRC_DIR ${RENDER_CORE_DIR}/third_party/codec/src)

set(SRC_FILES
        ${RENDER_CORE_SRC_DIR}/render/queue/render_queue.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/render_task.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/render_task_runner.cc
        ${RENDER_CORE_SRC_DIR}/render/queue/voltron_render_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/bridge_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/bridge_define.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/callback_manager.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/render_bridge_ffi_impl.cc
        ${RENDER_CORE_SRC_DIR}/render/ffi/string_convert.cc
        ${CODEC_SRC_DIR}/standard_codec.cc)

if ("${BUILD_SHARED_LIB}" STREQUAL "true")
endif()

include_directories(${RENDER_CORE_DIR}/third_party/codec/include)
include_directories(${RENDER_CORE_DIR}/include)

set(DOM_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../dom)
set(LAYOUT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../layout)

include_directories(${LAYOUT_DIR})

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/${ANDROID_ABI})
endif()

add_subdirectory(${DOM_DIR} dom)
include_directories(${DOM_DIR}/include)

set(LINKED_LIBS
        dom)

if ("${BUILD_SHARED_LIB}" STREQUAL "true")
    #add base sub
    set(FRAMEWORK_CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../driver/js/core)
    add_subdirectory(${FRAMEWORK_CORE_DIR}/third_party/base base)
    set(LINKED_LIBS ${LINKED_LIBS} tdf_base tdf_base_common)
    include_directories(${FRAMEWORK_CORE_DIR}/third_party/base/include)

    if (CMAKE_SYSTEM_NAME STREQUAL "Android")
        cmake_minimum_required(VERSION 3.4.1)
    elseif ((CMAKE_SYSTEM_NAME STREQUAL "Darwin") OR (CMAKE_SYSTEM_NAME STREQUAL "iOS"))
        cmake_minimum_required(VERSION 3.19.0)
    elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
        cmake_minimum_required(VERSION 3.15.0)
    endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

    if (CMAKE_SYSTEM_NAME STREQUAL "Android")
        add_library(${LIB_NAME} SHARED ${SRC_FILES})
        set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)
        target_link_libraries(${LIB_NAME} ${LINKED_LIBS})
    elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
        add_library(${LIB_NAME} SHARED ${SRC_FILES})
        set_target_properties(${CMAKE_LIBRARY_NAME} PROPERTIES
                FRAMEWORK TRUE
                )
        target_link_libraries(${LIB_NAME} ${LINKED_LIBS})
    elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
        add_library(${LIB_NAME} SHARED ${SRC_FILES})
        set_target_properties(${CMAKE_LIBRARY_NAME} PROPERTIES
                FRAMEWORK TRUE
                )
        target_link_libraries(${LIB_NAME} ${LINKED_LIBS})
    endif (CMAKE_SYSTEM_NAME STREQUAL "Android")
else()
    add_library(${LIB_NAME} STATIC ${SRC_FILES})
    target_link_libraries(${LIB_NAME} ${LINKED_LIBS})
    set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)
endif()

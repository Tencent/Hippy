cmake_minimum_required(VERSION 3.15.0)

add_compile_definitions(__WIN32__=1 UNICODE _UNICODE)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /utf-8")
set(CMAKE_LIBRARY_NAME "flexbox")

file(GLOB engine_src ../../engine/*.cpp)
#list(REMOVE_ITEM engine_src "E:/data/git/VoltronRender/flutter/core/third_party/layout/platform/windows/../../engine/HPStyle.cpp")
message(layout-engine-src-list: "${engine_src}")



file(GLOB ffi_src ../../ffi/*.cpp)
message(layout-ffi-src-list: "${ffi_src}")

file(GLOB taitank_src ../../taitank/*.cc)
message(layout-taitank-src-list: "${taitank_src}")

set(ENGINE_INCLUDE_DIR ${engine_src})

set(FFI_INCLUDE_DIR ${ffi_src})

set(TAITANK_INCLUDE_DIR ${ffi_src})

include_directories(${ENGINE_INCLUDE_DIR} ${FFI_INCLUDE_DIR} ${TAITANK_INCLUDE_DIR})

add_library(flexbox SHARED ${engine_src} ${taitank_src} ${ffi_src})

#for stablility, not use LLVM libc++ runtime: libc++_shared.so
#target_link_libraries(${CMAKE_LIBRARY_NAME} android c++_shared log)

#INSTALL(
#        FILES
#        ${CMAKE_BINARY_DIR}/\${CMAKE_INSTALL_CONFIG_NAME}/${CMAKE_LIBRARY_NAME}.pdb
#        ${CMAKE_BINARY_DIR}/\${CMAKE_INSTALL_CONFIG_NAME}/${CMAKE_LIBRARY_NAME}.lib
#        DESTINATION lib)
#
#INSTALL(
#        FILES
#        ${CMAKE_BINARY_DIR}/\${CMAKE_INSTALL_CONFIG_NAME}/${CMAKE_LIBRARY_NAME}.dll
#        DESTINATION dll)
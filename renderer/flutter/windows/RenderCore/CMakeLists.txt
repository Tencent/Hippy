cmake_minimum_required(VERSION 3.15.0)
project(VoltronRender LANGUAGES CXX)
cmake_policy(VERSION 3.0)


add_compile_definitions(__WIN32__=1 UNICODE _UNICODE)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /utf-8")
set(CMAKE_CXX_STANDARD 14)

set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -s")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -s")

set(CMAKE_LIBRARY_NAME "rendercore")


get_filename_component(HIPPY_CORE_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../core/third_party/hippy_core" REALPATH)
get_filename_component(TDF_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../core/third_party/tdf" REALPATH)
get_filename_component(CORE_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../core/" REALPATH)

get_filename_component(LIB_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../libs/flexbox" REALPATH)

add_definitions("-DWINDOWS")
add_definitions("-DV8_ENABLE_CHECKS")
add_subdirectory(${TDF_SRC_DIR} out)
message(TDF_SRC_DIR: ${TDF_SRC_DIR})


file(GLOB_RECURSE HIPPY_CORE_SRC ${HIPPY_CORE_SRC_DIR}/src/*.cc)
file(GLOB_RECURSE CORE_SRC ${CORE_SRC_DIR}/src/*.cc)
file(GLOB_RECURSE BRIDGE_IOS_SRC ${CORE_SRC_DIR}/src/bridge/ios/*)
file(GLOB_RECURSE WINDOWS_PRIVATE_SRC ${CMAKE_CURRENT_SOURCE_DIR}/../src/*.cc)

# windows has its own thread implemention
list(REMOVE_ITEM HIPPY_CORE_SRC ${HIPPY_CORE_SRC_DIR}/src/base/thread.cc)
list(REMOVE_ITEM HIPPY_CORE_SRC ${HIPPY_CORE_SRC_DIR}/src/base/thread_id.cc)

message(BRIDGE_IOS_SRC: ${BRIDGE_IOS_SRC})
list(REMOVE_ITEM CORE_SRC ${BRIDGE_IOS_SRC})

file(GLOB_RECURSE JSC_SRC ${HIPPY_CORE_SRC_DIR}/src/napi/jsc/*)
list(REMOVE_ITEM HIPPY_CORE_SRC ${JSC_SRC})

set(V8_LIB ${CMAKE_CURRENT_SOURCE_DIR}/../libs/v8/lib/v8.dll.lib)
set(V8_BASE_LIB ${CMAKE_CURRENT_SOURCE_DIR}/../libs/v8/lib/v8_libbase.dll.lib)
set(V8_PLATFORM_LIB ${CMAKE_CURRENT_SOURCE_DIR}/../libs/v8/lib/v8_libplatform.dll.lib)
set(ZLIB_LIB ${CMAKE_CURRENT_SOURCE_DIR}/../libs/v8/lib/zlib.dll.lib)

set(EXTERNAL_LIBS
        ${EXTERNAL_LIBS}
        ${V8_LIB}
        ${V8_BASE_LIB}
        ${V8_PLATFORM_LIB}
        ${ZLIB_LIB})

add_library(libv8 SHARED IMPORTED)
set_target_properties(libv8 PROPERTIES IMPORTED_LOCATION ${V8_LIB})

add_library(libv8_base SHARED IMPORTED)
set_target_properties(libv8_base PROPERTIES IMPORTED_LOCATION ${V8_BASE_LIB})

add_library(libv8_platform SHARED IMPORTED)
set_target_properties(libv8_platform PROPERTIES IMPORTED_LOCATION ${V8_PLATFORM_LIB})

add_library(libzlib SHARED IMPORTED)
set_target_properties(libzlib PROPERTIES IMPORTED_LOCATION ${ZLIB_LIB})

include_directories(${PROJECT_SOJNI_DIRURCE_DIR}/include)
include_directories(${TDF_SRC_DIR}/include)
include_directories(${CORE_SRC_DIR}/include)
include_directories(${HIPPY_CORE_SRC_DIR}/include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../include/v8)

add_library(${CMAKE_LIBRARY_NAME} SHARED ${HIPPY_CORE_SRC} ${CORE_SRC} ${WINDOWS_PRIVATE_SRC})
target_link_libraries(${CMAKE_LIBRARY_NAME} ${EXTERNAL_LIBS} base "Ws2_32.lib" "Wldap32.lib" "Shlwapi.lib")

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
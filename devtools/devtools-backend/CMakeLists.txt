cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_VERBOSE_MAKEFILE on)
set(PROJECT_NAME devtools_backend)
#set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -Os -Wall -s")
#set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -Os -Wall -s")
project(${PROJECT_NAME})
message("make devtools_backend so/.a")

set(ABI_COMPILE_OPTIONS -fexceptions -Wno-error -frtti)
add_compile_options(${ABI_COMPILE_OPTIONS})

get_filename_component(DEVTOOLS_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/" REALPATH)
set(BACKEND_INCLUDE_DIR ${DEVTOOLS_ROOT_PATH}/include)
message("DEVTOOLS_ROOT_PATH : ${DEVTOOLS_ROOT_PATH}")

# add include directories
include_directories(${BACKEND_INCLUDE_DIR})

set(WEBSOCKETPP_PATH ${DEVTOOLS_ROOT_PATH}/third_party/websocketpp)
set(ASIO_PATH ${DEVTOOLS_ROOT_PATH}/third_party/asio/include)
include_directories(${WEBSOCKETPP_PATH} ${ASIO_PATH})

# add library
file(GLOB_RECURSE DEVTOOLS_SRC ${DEVTOOLS_ROOT_PATH}/src/**)

if(ANDROID)
  add_definitions(-DOS_ANDROID)
  add_library(${PROJECT_NAME} STATIC ${DEVTOOLS_SRC})
elseif(IOS)
  add_definitions(-DOS_IOS)
  add_library(${PROJECT_NAME} ${DEVTOOLS_SRC})
elseif (APPLE)
    add_subdirectory("${DEVTOOLS_ROOT_PATH}/test" unit_test)
endif()

target_include_directories(${PROJECT_NAME} PUBLIC ${DEVTOOLS_ROOT_PATH}/third_party/nlohmann)

cmake_minimum_required(VERSION 3.9)

set(LIB_NAME "dom")

project("dom")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/.." REALPATH)
get_filename_component(CORE_DIR "${PROJECT_ROOT_DIR}/framework/js/core/" REALPATH)
get_filename_component(LAYOUT_DIR "${PROJECT_ROOT_DIR}/layout" REALPATH)
get_filename_component(THIRD_DIR "${PROJECT_ROOT_DIR}/third_party/" REALPATH)

message("DOM LAYOUT_DIR: ${LAYOUT_DIR}")

add_subdirectory(${LAYOUT_DIR} layout_out)
set(DEPS layout)

include_directories(${CORE_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(${LAYOUT_DIR})
include_directories(${THIRD_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/**)

#set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/dom)
add_library(${LIB_NAME} STATIC ${SRC_FILES})
target_link_libraries(${LIB_NAME} ${DEPS})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

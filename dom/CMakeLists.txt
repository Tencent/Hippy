set(LIB_NAME "dom")

project("dom")

get_filename_component(CORE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../framework/js/core/" REALPATH)
get_filename_component(LAYOUT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../layout" REALPATH)

message("LAYOUT_DIR: ${LAYOUT_DIR}")
include_directories(${CORE_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(${LAYOUT_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/**)

set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/dom)
add_library(${LIB_NAME} STATIC ${SRC_FILES})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

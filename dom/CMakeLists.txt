set(LIB_NAME "dom")

project("dom")

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../framework/js/core/include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../layout)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/**)
add_library(${LIB_NAME} STATIC ${SRC_FILES})

set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

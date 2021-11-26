set(LIB_NAME "layout")

project("layout")

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/engine)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/engine/*.cpp)

add_library(${LIB_NAME} STATIC ${SRC_FILES})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

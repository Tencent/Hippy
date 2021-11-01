set(LIB_NAME "tdf_base")

include_directories(${TDF_BASE_SOURCE_DIR}/include)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/* ${TDF_BASE_SOURCE_DIR}/src/base/*)

#set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/platform/adr)
find_library(ADR_LOG_LIB, log)
add_library(${LIB_NAME} STATIC ${SRC_FILES})
target_link_libraries(${LIB_NAME} ${ADR_LOG_LIB})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 14)
set(LIB_NAME "footstone")

include_directories(${FOOTSTONE_PATH})
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/* ${FOOTSTONE_PATH}/src/footstone/*)

#set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/platform/adr)
find_library(ADR_LOG_LIB, log)
add_library(${LIB_NAME} STATIC ${SRC_FILES})

#json
add_subdirectory(${THIRD_PARTY}/json nlohmann_json)
target_link_libraries(${LIB_NAME} nlohmann_json)

target_link_libraries(${LIB_NAME} ${ADR_LOG_LIB})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

if (DEFINED ALLOCATE_WITH_META)
    target_compile_definitions(${LIB_NAME} PUBLIC ALLOCATE_WITH_META=1)
endif ()
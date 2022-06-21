set(LIB_NAME "footstone")

include_directories(${FOOTSTONE_PATH}/include)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/** ${FOOTSTONE_PATH}/src/footstone/**)

#set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/platform/adr)
find_library(ADR_LOG_LIB, log)
find_library(ADR_LOOPER_LIB, looper)
add_library(${LIB_NAME} STATIC ${SRC_FILES})

target_link_libraries(${LIB_NAME} ${ADR_LOG_LIB} android)
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

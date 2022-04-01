cmake_minimum_required(VERSION 3.17)
set(CMAKE_CXX_STANDARD 17)
set(PROJECT_NAME devtools_backend)
project(${PROJECT_NAME})

add_definitions(-DOS_IOS)
get_filename_component(DEVTOOLS_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../" REALPATH)

set(BACKEND_ROOT_DIR ../..)
#add include directories
set(BACKEND_INCLUDE_DIR
		${BACKEND_ROOT_DIR}/include)


include_directories(${BACKEND_INCLUDE_DIR})

#add library
file(GLOB_RECURSE ALL_SOURCE_FILE
		${BACKEND_ROOT_DIR}/src/**)

add_library(${PROJECT_NAME} ${ALL_SOURCE_FILE})

target_include_directories(${PROJECT_NAME} PUBLIC ${DEVTOOLS_ROOT_PATH}/third_party/nlohmann)

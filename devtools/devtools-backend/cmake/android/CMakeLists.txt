cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 17)
set(PROJECT_NAME devtools_backend)
set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -Os -Wall -s")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -Os -Wall -s")
project(${PROJECT_NAME})

set(ABI_COMPILE_OPTIONS -fexceptions -Wno-error)
add_compile_options(${ABI_COMPILE_OPTIONS})

message("CMAKE_ANDROID_ARCH_ABI: ${CMAKE_ANDROID_ARCH_ABI}")

add_definitions(-DOS_ANDROID)
get_filename_component(DEVTOOLS_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../" REALPATH)
message("CMAKE_CURRENT_SOURCE_DIR : ${CMAKE_CURRENT_SOURCE_DIR}")
message("devtools root path : ${DEVTOOLS_ROOT_PATH}")

get_filename_component(DEVTOOLS_ANDROID_JNI_DIR "${DEVTOOLS_ROOT_PATH}/android/devtools-backend/src/main/jni" REALPATH)
#add include directories
set(BACKEND_INCLUDE_DIR
        ${DEVTOOLS_ROOT_PATH}/include
        ${DEVTOOLS_ANDROID_JNI_DIR}/include)

include_directories(${BACKEND_INCLUDE_DIR})

#add library
file(GLOB_RECURSE DEVTOOLS_SRC
        ${DEVTOOLS_ROOT_PATH}/src/**)

file(GLOB_RECURSE JNI_SRC ${DEVTOOLS_ANDROID_JNI_DIR}/src/**)


add_library(${PROJECT_NAME} STATIC ${DEVTOOLS_SRC} ${JNI_SRC})
message("DEVTOOLS_ROOT_PATH=${DEVTOOLS_ROOT_PATH}")

target_link_libraries(${PROJECT_NAME} log)

target_include_directories(${PROJECT_NAME} PUBLIC ${DEVTOOLS_ROOT_PATH}/third_party/nlohmann)

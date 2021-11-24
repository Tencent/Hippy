project("voltron_core_android")

cmake_minimum_required(VERSION 3.9)

if(NOT CMAKE_SYSTEM_NAME STREQUAL "Android")
    set(CMAKE_CXX_STANDARD 17)
endif()

add_definitions(-D__ANDROID__)

set(GENERATOR "Android Gradle - Ninja")

set(JS_ENGINE "V8")
set(V8_TAG "V8_RELEASE")
set(ANDROID_CPP_FEATURES "rtti exceptions")
set(ANDROID_PLATFORM "android-28")
set(ANDROID_STL "c++_shared")
set(CMAKE_BUILD_TYPE "Debug")
set(V8_RELEASE "official-release")
set(EXT_JS_ENGINE_LIB "false")
set(CMAKE_SELF_PROJECT_BUILD_OUTPUT_DIR $CMAKE_CURRENT_LIST_DIR)

add_subdirectory(../../../dom ${CMAKE_SELF_PROJECT_BUILD_OUTPUT_DIR}/dom)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/src/main/jni/ ${CMAKE_SELF_PROJECT_BUILD_OUTPUT_DIR}/rendercore)
add_subdirectory(../core/third_party/layout ${CMAKE_SELF_PROJECT_BUILD_OUTPUT_DIR}/flexbox)

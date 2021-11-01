cmake_minimum_required(VERSION 3.4.1)

set(GENERATOR "Android Gradle - Ninja")

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/src/main/jni/ ${CMAKE_SELF_PROJECT_BUILD_OUTPUT_DIR}/rendercore)
add_subdirectory(../core/third_party/layout ${CMAKE_SELF_PROJECT_BUILD_OUTPUT_DIR}/flexbox)

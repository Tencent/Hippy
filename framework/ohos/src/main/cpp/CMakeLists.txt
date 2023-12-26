cmake_minimum_required(VERSION 3.14)

project(hippy)

set(HIPPY_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(HIPPY_IMPL_CPP_DIR "${HIPPY_CPP_DIR}/impl")

add_subdirectory("${HIPPY_IMPL_CPP_DIR}" ./hippy_impl)

add_library(${PROJECT_NAME} SHARED
)

target_link_libraries(${PROJECT_NAME} PUBLIC hippy_impl)

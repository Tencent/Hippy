cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_VERBOSE_MAKEFILE on)
project(GTEST_HIPPY_DOM)
add_compile_options(
	-fno-rtti
	-std=c++11
	-Werror
	-fno-exceptions
	 )

set(CMAKE_CXX_STANDARD 17)
set(DOM_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../dom)
set(CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../framework/js/core/)
set(LAYOUT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../layout)
set(JSON_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../third_party/)

add_subdirectory(${DOM_DIR} dom_out)
add_subdirectory(${CORE_DIR}/third_party/base/ base_out)

include_directories(${DOM_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(./)
include_directories(${LAYOUT_DIR})
include_directories(${JSON_DIR})

file(GLOB tests_src ./tests/*.cpp)
message( tests_src list: "${tests_src}")
file(GLOB gtest_src ./*.cc)
message( gtest_src list: "${gtest_src}")

add_executable(gtest_hippy_dom  ${tests_src}  ${gtest_src})
target_link_libraries(gtest_hippy_dom pthread dom tdf_base tdf_base_common)

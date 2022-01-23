cmake_minimum_required(VERSION 3.4.1)
project(unit_test)
set(CMAKE_CXX_STANDARD 17)

add_compile_options(
	-fno-rtti
	-Werror
	-fno-exceptions
)

# dependency google test
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/609281088cfefc76f9d0ce82e1ff6c30cc3591e5.zip
)
FetchContent_MakeAvailable(googletest)

set(PROJECT_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/..)
set(DOM_DIR ${PROJECT_ROOT_DIR}/dom)
set(CORE_DIR ${PROJECT_ROOT_DIR}/framework/js/core)
set(LAYOUT_DIR ${PROJECT_ROOT_DIR}/layout)
set(JSON_DIR ${PROJECT_ROOT_DIR}/third_party)

add_subdirectory(${DOM_DIR} dom_out)
add_subdirectory(${CORE_DIR}/third_party/base base_out)

include_directories(${DOM_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(./)
include_directories(${LAYOUT_DIR})
include_directories(${JSON_DIR})

file(GLOB DOM_UT_FILES dom/*.cc)

add_executable(unit_test main.cc ${DOM_UT_FILES})
target_link_libraries(unit_test gtest_main dom tdf_base tdf_base_common)
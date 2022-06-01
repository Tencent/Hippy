cmake_minimum_required(VERSION 3.11.1)
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

# FetchContent nlohmann_json
FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.10.5/json.tar.xz)
FetchContent_MakeAvailable(json)

# open hippy unit test
add_definitions(-DHIPPY_TEST)

set(PROJECT_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/..)
set(DOM_DIR ${PROJECT_ROOT_DIR}/dom)
set(CORE_DIR ${PROJECT_ROOT_DIR}/driver/js/core)
set(LAYOUT_DIR ${PROJECT_ROOT_DIR}/layout)
set(JSON_DIR ${PROJECT_ROOT_DIR}/third_party)

add_subdirectory(${DOM_DIR} dom_out)
add_subdirectory(${CORE_DIR}/third_party/base base_out)

include_directories(${DOM_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(${CORE_DIR}/include)
include_directories(${LAYOUT_DIR})
include_directories(${JSON_DIR})

set(COMMON_SRC_FILES ${CORE_DIR}/src/task/common_task.cc)
file(GLOB_RECURSE CORE_SRC_FILES ${CORE_DIR}/src/base/*.cc)
file(GLOB_RECURSE DOM_UT_FILES ${DOM_DIR}/src/dom/*_ut.cc)
message("COMMON_SRC_FILES:${COMMON_SRC_FILES}")
message("CORE_SRC_FILES:${CORE_SRC_FILES}")
message("DOM_UT_FILES:${DOM_UT_FILES}")

add_executable(unit_test main.cc ${DOM_UT_FILES} ${CORE_SRC_FILES} ${COMMON_SRC_FILES})
target_link_libraries(unit_test gtest_main nlohmann_json tdf_base tdf_base_common dom)

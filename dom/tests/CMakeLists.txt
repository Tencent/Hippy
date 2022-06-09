cmake_minimum_required(VERSION 3.11.1)

project(hippy_unit_test)


include("../../buildconfig/cmake/InfraPackagesModule.cmake")
include("../../buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_CXX_STANDARD 17)

add_compile_options(
	-fno-rtti
	-Werror
	-fno-exceptions
)

# dependency google test
InfraPackage_Add(asio
  REMOTE "test/third_party/googletest/release-1.11.0/googletest.release-1.11.0.tgz"
  LOCAL "third_party/googletest"
)

# InfaPackage nlohmann_json
InfraPackage_Add(json
  REMOTE "devtools/backend/third_party/json/3.10.5/json.tar.xz"
  LOCAL "third_party/json"
)
include_directories(${json_SOURCE_DIR}/include)

# open hippy unit test
add_definitions(-DHIPPY_TEST)

message("CMAKE_CURRENT_SOURCE_DIR:${CMAKE_CURRENT_SOURCE_DIR}")
set(PROJECT_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../..)
set(DOM_DIR ${PROJECT_ROOT_DIR}/dom)
set(CORE_DIR ${PROJECT_ROOT_DIR}/driver/js/core)
set(LAYOUT_DIR ${PROJECT_ROOT_DIR}/layout)

add_subdirectory(${DOM_DIR} dom_out)
add_subdirectory(${CORE_DIR}/third_party/base base_out)

include_directories(${DOM_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(${CORE_DIR}/include)
include_directories(${LAYOUT_DIR})

set(COMMON_SRC_FILES ${CORE_DIR}/src/task/common_task.cc)
file(GLOB_RECURSE CORE_SRC_FILES ${CORE_DIR}/src/base/*.cc)
file(GLOB_RECURSE DOM_UT_FILES ${DOM_DIR}/src/dom/*_unittests.cc)
message("COMMON_SRC_FILES:${COMMON_SRC_FILES}")
message("CORE_SRC_FILES:${CORE_SRC_FILES}")
message("DOM_UT_FILES:${DOM_UT_FILES}")

add_executable(unit_test main.cc ${DOM_UT_FILES} ${CORE_SRC_FILES} ${COMMON_SRC_FILES})
target_link_libraries(unit_test gtest_main nlohmann_json::nlohmann_json tdf_base tdf_base_common dom)

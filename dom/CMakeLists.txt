cmake_minimum_required(VERSION 3.14)

project("dom")

set(LIB_NAME "dom")
set(LAYOUT_ENGINE "Taitank")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/.." REALPATH)
get_filename_component(CORE_DIR "${PROJECT_ROOT_DIR}/driver/js/core/" REALPATH)

message("LAYOUT_ENGINE:" ${LAYOUT_ENGINE})
if (${LAYOUT_ENGINE} STREQUAL "Yoga")
  include(FetchContent)
  # FetchContent yoga
  FetchContent_Declare(
        yoga
        GIT_REPOSITORY https://github.com/facebook/yoga.git
        GIT_TAG v1.19.0  # branch origin/develop
        GIT_SHALLOW TRUE
  )
  FetchContent_GetProperties(yoga)
  if(NOT yoga_POPULATED)
    FetchContent_Populate(yoga)
    add_subdirectory(${yoga_SOURCE_DIR} yoga)
    include_directories(${yoga_SOURCE_DIR}/yoga)
    set(DEPS yogacore)
  endif()
elseif (${LAYOUT_ENGINE} STREQUAL "Taitank")
  add_definitions("-DUSE_TAITANK")
  get_filename_component(TAITANK_LAYOUT_DIR "${PROJECT_ROOT_DIR}/layout" REALPATH)
  add_subdirectory(${TAITANK_LAYOUT_DIR} layout_out)
  include_directories(${TAITANK_LAYOUT_DIR})
  set(DEPS layout)
else()
  message(FATAL_ERROR "Layout Engine ${LAYOUT_ENGINE} is not supported")
endif()

include_directories(${CORE_DIR}/include)
include_directories(${CORE_DIR}/third_party/base/include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)
file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/**.cc)
if (${LAYOUT_ENGINE} STREQUAL "Yoga")
  list(REMOVE_ITEM SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/dom/taitank_layout_node.cc)
elseif(${LAYOUT_ENGINE} STREQUAL "Taitank")
  list(REMOVE_ITEM SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/dom/yoga_layout_node.cc)
else()
  message(FATAL_ERROR "Layout Engine ${LAYOUT_ENGINE} is not supported")
endif()

# exclude test files
file(GLOB_RECURSE DOM_UT_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/**_unittests.cc)
list(REMOVE_ITEM SRC_FILES ${DOM_UT_FILES})
message("SRC_FILES:${SRC_FILES}")

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/${ANDROID_ABI})
endif()

add_library(${LIB_NAME} STATIC ${SRC_FILES})
target_link_libraries(${LIB_NAME} ${DEPS})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

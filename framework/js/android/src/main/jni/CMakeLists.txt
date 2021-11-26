cmake_minimum_required(VERSION 3.4.1)

project("hippy")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_VISIBILITY_PRESET hidden)

if (${ANDROID_STL} STREQUAL "c++_static")
  string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,--exclude-libs,libc++_static.a")
  string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,--exclude-libs,libc++abi.a")
endif()

# region ABI_COMPILE_OPTIONS
set(ABI_COMPILE_OPTIONS
        -fno-rtti
        -fno-threadsafe-statics
        -fvisibility-inlines-hidden
        -std=c++14
        --param=ssp-buffer-size=4
        -Werror
        -fno-exceptions
        -fno-strict-aliasing
        -Wall
        -fexceptions
        -Wno-unused-parameter
        -Wno-missing-field-initializers
        -pipe
        -fPIC
        -Wno-unused-local-typedefs
        -funwind-tables
        -fstack-protector
        -fno-short-enums
        -Os
        -g
        -fdata-sections
        -ffunction-sections
        -fomit-frame-pointer)

message("ANDROID_ABI: ${ANDROID_ABI}")
if (${ANDROID_ABI} STREQUAL "armeabi-v7a")
  set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
          -march=armv7-a
          -mtune=generic-armv7-a
          -mfpu=vfpv3-d16
          -mfloat-abi=softfp
          -mthumb)
elseif (${ANDROID_ABI} STREQUAL "arm64-v8a")
  # (Empty)
elseif (${ANDROID_ABI} STREQUAL "x86")
  set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
          -march=i686
          -mtune=intel
          -m32
          -mssse3
          -mfpmath=sse)
elseif (${ANDROID_ABI} STREQUAL "x86_64")
  set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
          -march=x86-64
          -mtune=intel
          -m64
          -mpopcnt
          -msse4.2)
else()
  message(FATAL_ERROR "${ANDROID_ABI} is not supported")
endif()

if (${HIDDEN_LIBRARY_SYMBOL} STREQUAL "true")
  set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS} -fvisibility=hidden)
endif()

message("ABI_COMPILE_OPTIONS: ${ABI_COMPILE_OPTIONS}")
add_compile_options(${ABI_COMPILE_OPTIONS})
# endregion

get_filename_component(CORE_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../core" REALPATH)
get_filename_component(DOM_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../dom" REALPATH)
get_filename_component(LAYOUT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../layout" REALPATH)

# region subdirectory
add_subdirectory(${CORE_SRC_DIR}/third_party/base base_out)
add_subdirectory(${DOM_SRC_DIR} dom_out)
set(ENABLE_INSPECTOR true)
if (${JS_ENGINE} STREQUAL "V8")
  get_filename_component(V8_COMPONENT_PATH ${V8_COMPONENT} ABSOLUTE)
  add_subdirectory(${V8_COMPONENT_PATH})
endif()
# endregion

# region global definitions
if (${ENABLE_INSPECTOR} STREQUAL "true")
  add_definitions("-DENABLE_INSPECTOR")
endif()
add_definitions("-DOS_ANDROID")
add_definitions("-DANDROID")
# endregion

# region source
file(GLOB_RECURSE CORE_SRC ${CORE_SRC_DIR}/src/*.cc)
file(GLOB_RECURSE JNI_SRC ${PROJECT_SOURCE_DIR}/src/*.cc)
if (${ENABLE_INSPECTOR} STREQUAL "false")
  file(GLOB_RECURSE INSPECTOR_SRC ${PROJECT_SOURCE_DIR}/src/inspector/*)
  list(REMOVE_ITEM JNI_SRC ${INSPECTOR_SRC})
endif()

message("CORE_SRC_DIR: ${CORE_SRC_DIR}")
message("CORE_SRC: ${CORE_SRC}")
message("JNI_SRC: ${JNI_SRC}")
# endregion

set(HIPPY_DEPS android log tdf_base tdf_base_common dom)

message("JS_ENGINE:" ${JS_ENGINE})
if (${JS_ENGINE} STREQUAL "V8")
  # region remove jsc code
  file(GLOB_RECURSE JSC_SRC ${CORE_SRC_DIR}/src/napi/jsc/*)
  message("JSC_SRC: ${JSC_SRC}")
  list(REMOVE_ITEM CORE_SRC ${JSC_SRC})
  # endregion
  # region library
  if (${V8_LINKING_MODE} STREQUAL "shared")
    add_library(v8 SHARED IMPORTED)
  elseif (${V8_LINKING_MODE} STREQUAL "static")
    string(APPEND CMAKE_SHARED_LINKER_FLAGS " -Wl,--exclude-libs,${V8_LIBRARY_NAME}")
    add_library(v8 STATIC IMPORTED)
  else()
    message(FATAL_ERROR "V8_LINKING_MODE expected to be `shared` or `static`, but received ${V8_LINKING_MODE}")
  endif()
  set_property(TARGET v8 PROPERTY IMPORTED_LOCATION ${V8_LIBRARY_PATH}/${V8_LIBRARY_NAME})
  list(APPEND HIPPY_DEPS v8)
  # endregion
  foreach(INCLUDE_DIRECTORY ${V8_INCLUDE_DIRECTORIES})
    include_directories(${INCLUDE_DIRECTORY})
  endforeach()
  foreach(DEFINITION ${V8_DEFINITIONS})
    add_definitions(${DEFINITION})
  endforeach()
elseif (${JS_ENGINE} STREQUAL "JSC")
  # region remove v8 code
  file(GLOB_RECURSE V8_SRC ${CORE_SRC_DIR}/src/napi/v8/*)
  message("V8_SRC: ${V8_SRC}")
  list(REMOVE_ITEM CORE_SRC ${V8_SRC})
  # endregion
else()
  message(FATAL_ERROR "${JS_ENGINE} is not supported")
endif()

include_directories(${PROJECT_SOURCE_DIR}/include)
include_directories(${CORE_SRC_DIR}/include)
include_directories(${CORE_SRC_DIR}/third_party/base/include)
include_directories(${DOM_SRC_DIR}/include)
include_directories(${LAYOUT_DIR})

add_library(${CMAKE_PROJECT_NAME} SHARED ${CORE_SRC} ${URL_PARSER_SRC} ${JNI_SRC})
target_link_libraries(${CMAKE_PROJECT_NAME} ${HIPPY_DEPS})
set_property(TARGET ${CMAKE_PROJECT_NAME} PROPERTY CXX_STANDARD 17)

if ((${JS_ENGINE} STREQUAL "V8") AND (${V8_LINKING_MODE} STREQUAL "shared"))
  foreach(LIBRARY_DEP ${V8_LIBRARY_DEPS})
    add_custom_command(
            TARGET ${CMAKE_PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy ${V8_LIBRARY_PATH}/${LIBRARY_DEP} $<TARGET_FILE_DIR:${CMAKE_PROJECT_NAME}>)
  endforeach()
endif()

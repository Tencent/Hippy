cmake_minimum_required(VERSION 3.4.1)

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_VISIBILITY_PRESET hidden)

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
	-fomit-frame-pointer
  )

message("CMAKE_ANDROID_ARCH_ABI: ${CMAKE_ANDROID_ARCH_ABI}")

if (${CMAKE_ANDROID_ARCH_ABI} STREQUAL "armeabi-v7a")
  set(ABI_COMPILE_OPTIONS
    ${ABI_COMPILE_OPTIONS}
    -march=armv7-a
	  -mtune=generic-armv7-a
	  -mfpu=vfpv3-d16
	  -mfloat-abi=softfp
	  -mthumb
  )
elseif (${CMAKE_ANDROID_ARCH_ABI} STREQUAL "arm64-v8a")

elseif (${CMAKE_ANDROID_ARCH_ABI} STREQUAL "x86")
  set(ABI_COMPILE_OPTIONS
    ${ABI_COMPILE_OPTIONS}
    -march=i686
	  -mtune=intel
	  -m32
	  -mssse3
	  -mfpmath=sse
  )
elseif (${CMAKE_ANDROID_ARCH_ABI} STREQUAL "x86_64")
  set(ABI_COMPILE_OPTIONS
    ${ABI_COMPILE_OPTIONS}
    -march=x86-64
	  -mtune=intel
	  -m64
	  -mpopcnt
	  -msse4.2
    )
else()
  message(FATAL_ERROR "${CMAKE_ANDROID_ARCH_ABI} is not supported")
endif()
message("ABI_COMPILE_OPTIONS: ${ABI_COMPILE_OPTIONS}")

add_definitions("-DANDROID")
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../../../../core/third_party/base out)

add_definitions("-DOS_ANDROID")
add_compile_options(${ABI_COMPILE_OPTIONS})

get_filename_component(CORE_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../core" REALPATH)

file(GLOB_RECURSE CORE_SRC ${CORE_SRC_DIR}/src/*.cc)
file(GLOB_RECURSE JNI_SRC ${PROJECT_SOURCE_DIR}/src/*.cc)

message("PROJECT_SOURCE_DIR: ${PROJECT_SOURCE_DIR}")
message("CORE_SRC_DIR: ${CORE_SRC_DIR}")
message("JNI_SRC: ${JNI_SRC}")

set(HIPPY_TARGET_NAME "hippybridge")
set(HIPPY_DEPS android log tdf_base)

message("JS_ENGINE:" ${JS_ENGINE})
if (${JS_ENGINE} STREQUAL "V8")
  message("V8_TAG: ${V8_TAG}")
  message("V8_RELEASE: ${V8_RELEASE}")
  add_definitions("-DV8_IMMINENT_DEPRECATION_WARNINGS")
  add_definitions("-DV8_DEPRECATION_WARNINGS")
  # region remove jsc code
  file(GLOB_RECURSE JSC_SRC ${CORE_SRC_DIR}/src/napi/jsc/*)
  message("JSC_SRC: ${JSC_SRC}")
  list(REMOVE_ITEM CORE_SRC ${JSC_SRC})
  # endregion
  # region determine v8
  if ((${V8_TAG} STREQUAL "latest") AND (${V8_RELEASE} STREQUAL "x5-lite"))
    message(FATAL_ERROR "x5-lite release package not available in latest tag")
  endif()
  if (${V8_TAG} STREQUAL "latest")
    add_definitions("-DV8_LATEST")
    if ((${ANDROID_ABI} STREQUAL "arm64-v8a") OR (${ANDROID_ABI} STREQUAL "x86_64"))
      add_definitions("-DV8_COMPRESS_POINTERS")
    endif()
  endif()
  if (${V8_RELEASE} STREQUAL "x5-lite")
    add_definitions("-DV8_X5_LITE")
    set(V8_SO "libmttv8.so")
    # region remove inspector code when x5-lite
    file(GLOB_RECURSE INSPECTOR_SRC ${PROJECT_SOURCE_DIR}/src/inspector/*)
    list(REMOVE_ITEM JNI_SRC ${INSPECTOR_SRC})
    # endregion
  elseif (${V8_RELEASE} STREQUAL "official-release")
    add_definitions("-DV8_OFFICIAL_RELEASE")
    add_definitions("-DV8_HAS_INSPECTOR")
    set(V8_SO "libv8.cr.so")
  else()
    message(FATAL_ERROR "${V8_RELEASE} is not supported")
  endif()
  # endregion
  # region library & include
  set(V8_ROOT ${PROJECT_SOURCE_DIR}/third_party/v8/${V8_TAG}/${V8_RELEASE})
  add_library(v8 SHARED IMPORTED)
  set_property(TARGET v8 PROPERTY IMPORTED_LOCATION ${V8_ROOT}/libs/${ANDROID_ABI}/${V8_SO})
  list(APPEND HIPPY_DEPS v8)
  if (${V8_RELEASE} STREQUAL "official-release")
    add_library(v8platform SHARED IMPORTED)
    set_property(TARGET v8platform PROPERTY IMPORTED_LOCATION ${V8_ROOT}/libs/${ANDROID_ABI}/libv8_libplatform.cr.so)
    list(APPEND HIPPY_DEPS v8platform)
  endif()
  include_directories(${V8_ROOT}/include)
  include_directories(${V8_ROOT}/include/v8)
  # endregion
elseif (${JS_ENGINE} STREQUAL "JSC")
  # region remove v8 code
  file(GLOB_RECURSE V8_SRC ${CORE_SRC_DIR}/src/napi/v8/*)
  message("V8_SRC: ${V8_SRC}")
  list(REMOVE_ITEM CORE_SRC ${V8_SRC})
  # endregion
else()
  message(FATAL_ERROR "${JS_ENGINE} is not supported")
endif()
message("CORE_SRC: ${CORE_SRC}")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE}")

include_directories(${PROJECT_SOURCE_DIR}/include)
include_directories(${CORE_SRC_DIR}/include)
include_directories(${PROJECT_SOURCE_DIR})
include_directories(${CORE_SRC_DIR}/third_party/base/include)

add_library(${HIPPY_TARGET_NAME} SHARED ${CORE_SRC} ${URL_PARSER_SRC} ${JNI_SRC})
target_link_libraries(${HIPPY_TARGET_NAME} ${HIPPY_DEPS})

if (${JS_ENGINE} STREQUAL "V8")
  if (${EXT_JS_ENGINE_LIB} STREQUAL "true" OR ${EXT_JS_ENGINE_LIB} STREQUAL "1")
    add_custom_command(
            TARGET ${HIPPY_TARGET_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E remove $<TARGET_FILE_DIR:${HIPPY_TARGET_NAME}>/${V8_SO})
  else()
    add_custom_command(
            TARGET ${HIPPY_TARGET_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_directory ${PROJECT_SOURCE_DIR}/third_party/v8/${V8_TAG}/${V8_RELEASE}/libs/${ANDROID_ABI} $<TARGET_FILE_DIR:${HIPPY_TARGET_NAME}>
            COMMAND ${CMAKE_COMMAND} -E remove_directory $<TARGET_FILE_DIR:${HIPPY_TARGET_NAME}>/lib.unstripped)
  endif()
endif()
#add_custom_command(TARGET ${HIPPY_TARGET_NAME} POST_BUILD
#            COMMAND "${CMAKE_STRIP}" -g -S -d --strip-debug --verbose
#            ../../../build/outputs/${CMAKE_ANDROID_ARCH_ABI}/lib${HIPPY_TARGET_NAME}.so
#            COMMENT "Strip debug symbols")


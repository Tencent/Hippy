if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  cmake_minimum_required(VERSION 3.14.0)
elseif ((CMAKE_SYSTEM_NAME STREQUAL "Darwin") OR (CMAKE_SYSTEM_NAME STREQUAL "iOS"))
  cmake_minimum_required(VERSION 3.19.0)
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
  cmake_minimum_required(VERSION 3.15.0)
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

cmake_policy(VERSION 3.0)

project("voltron_core")

add_definitions("-DVOLTRON")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../.." REALPATH)

set(SOURCE_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR})
set(FRAMEWORK_DIR ${PROJECT_ROOT_DIR}/framework/)
set(RENDER_DIR ${PROJECT_ROOT_DIR}/renderer/voltron/core)

message("PROJECT_ROOT_DIR: ${PROJECT_ROOT_DIR}")

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/compile_option.cmake)
include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/voltron_core.cmake)

# region footstone
GlobalPackages_Add(footstone)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} footstone)
# endregion

# region js_driver
add_subdirectory(${PROJECT_ROOT_DIR}/driver/js ${CMAKE_CURRENT_BINARY_DIR}/driver/js)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} js_driver)
# endregion

# region dom
GlobalPackages_Add(dom)
set(FRAMEWORK_CORE_DEPS ${FRAMEWORK_CORE_DEPS} dom)
# endregion

# region voltron renderer
add_subdirectory(${RENDER_DIR} render_core)
include_directories(${RENDER_DIR}/include)
include_directories(${RENDER_DIR}/third_party/codec/include)
# endregion

# region library
add_library(${PROJECT_NAME} SHARED)
target_include_directories(${PROJECT_NAME} PRIVATE ${PROJECT_SOURCE_DIR}/include)
# endregion

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  target_compile_options(${PROJECT_NAME} PRIVATE ${ABI_COMPILE_OPTIONS})

  # region stl
  if (${ANDROID_STL} STREQUAL "c++_static")
    target_link_options(${PROJECT_NAME} PRIVATE
            "-Wl,--exclude-libs,libc++_static.a"
            "-Wl,--exclude-libs,libc++abi.a")
  endif ()
  # endregion

  # region v8
  if ("${JS_ENGINE}" STREQUAL "V8")
    GlobalPackages_Add(v8)
    target_link_libraries(${PROJECT_NAME} PRIVATE v8)
    get_target_property(V8_WITHOUT_INSPECTOR v8 INTERFACE_V8_WITHOUT_INSPECTOR)
    if (V8_WITHOUT_INSPECTOR)
      target_compile_definitions(${PROJECT_NAME} PRIVATE "V8_WITHOUT_INSPECTOR")
    endif ()
  endif ()
  # endregion

  # region framework_core
  target_link_libraries(${PROJECT_NAME} PRIVATE ${FRAMEWORK_CORE_DEPS})
  # endregion

  # region framework_android
  target_link_libraries(${PROJECT_NAME} PRIVATE ${FRAMEWORK_ANDROID_DEPS})
  # endregion

  # region voltron renderer
  target_link_libraries(${PROJECT_NAME} PUBLIC render_core)
  # endregion

  set(SOURCE_SET
          ${VOLTRON_CORE_SRC_FILES})
elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
  set_target_properties(${PROJECT_NAME} PROPERTIES
          FRAMEWORK TRUE
          MACOSX_FRAMEWORK_IDENTIFIER com.tencent.RenderCore
          MACOSX_FRAMEWORK_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/../VoltronCore/VoltronCore/Info.plist
          PUBLIC_HEADER "${DARWIN_HEADERS}"
          )
  set(LINKED_LIBS ${FRAMEWORK_CORE_DEPS})
  find_library(
          ${LINKED_LIBS}
  )
  find_library(JSCORE_LIBRARY JavaScriptCore)
  list(APPEND LINKED_LIBS -Wl,-framework,Security)
  list(APPEND LINKED_LIBS -Wl,-framework,Foundation)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreFoundation)
  list(APPEND LINKED_LIBS -Wl,-framework,SystemConfiguration)
  list(APPEND LINKED_LIBS -Wl,-framework,UIKit)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreTelephony)
  list(APPEND LINKED_LIBS -Wl,-framework,IOKit)
  list(APPEND LINKED_LIBS -Wl,-framework,QuartzCore)
  list(APPEND LINKED_LIBS -coverage)
  list(APPEND LINKED_LIBS -liconv)
  list(APPEND LINKED_LIBS -lresolv)
  list(APPEND LINKED_LIBS -lbsm)
  list(APPEND LINKED_LIBS -lz)

  target_link_libraries( # Specifies the target library.
          ${PROJECT_NAME}
          PRIVATE
          ${LINKED_LIBS}
          ${JSCORE_LIBRARY}
          )

  # region voltron renderer
  target_link_libraries(${PROJECT_NAME} PUBLIC render_core)
  # endregion

  set(SOURCE_SET
          ${VOLTRON_CORE_SRC_FILES}
          ${DARWIN_HEADERS})
elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
  add_library(
          # Sets the name of the library.
          ${PROJECT_NAME}

          # Sets the library as a shared library.
          SHARED

          # Provides a relative path to your source file(s).
          # Associated headers in the same location as their source
          # file are automatically included.
          ${SRC_FILES}
          ${DARWIN_HEADERS}
  )
  set_target_properties(${PROJECT_NAME} PROPERTIES
          FRAMEWORK TRUE
          MACOSX_FRAMEWORK_IDENTIFIER com.tencent.RenderCore
          MACOSX_FRAMEWORK_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/../VoltronCore/VoltronCore/Info.plist
          PUBLIC_HEADER "${DARWIN_HEADERS}"
          )
  find_library(
          ${LINKED_LIBS}
  )
  find_library(JSCORE_LIBRARY JavaScriptCore)
  list(APPEND LINKED_LIBS -Wl,-framework,Cocoa)
  list(APPEND LINKED_LIBS -Wl,-framework,Security)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreGraphics)
  list(APPEND LINKED_LIBS -Wl,-framework,Foundation)
  list(APPEND LINKED_LIBS -Wl,-framework,SystemConfiguration)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreText)
  list(APPEND LINKED_LIBS -Wl,-framework,CoreServices)
  list(APPEND LINKED_LIBS -Wl,-framework,AppKit)
  list(APPEND LINKED_LIBS -Wl,-framework,IOKit)
  list(APPEND LINKED_LIBS -Wl,-framework,QuartzCore)
  list(APPEND LINKED_LIBS -coverage)
  list(APPEND LINKED_LIBS -liconv)
  list(APPEND LINKED_LIBS -lresolv)
  list(APPEND LINKED_LIBS -lbsm)
  target_link_libraries( # Specifies the target library.
          ${PROJECT_NAME}
          ${LINKED_LIBS}
          ${JSCORE_LIBRARY}
          )
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

# region source set
# This is a top-level shared library,
# so the source code visibility is always PRIVATE
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# endregion




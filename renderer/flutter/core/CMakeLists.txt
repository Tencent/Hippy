if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    cmake_minimum_required(VERSION 3.4.1)
elseif ((CMAKE_SYSTEM_NAME STREQUAL "Darwin") OR (CMAKE_SYSTEM_NAME STREQUAL "iOS"))
    cmake_minimum_required(VERSION 3.19.0)
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
    cmake_minimum_required(VERSION 3.15.0)
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")

cmake_policy(VERSION 3.0)

#add_definitions(-D__ANDROID__)

project(VoltronCore)

set(CMAKE_LIBRARY_NAME "voltron_core")

set(SOURCE_ROOT_DIR ${CMAKE_CURRENT_SOURCE_DIR})

# Android在build.gradle里指定
if (NOT CMAKE_SYSTEM_NAME STREQUAL "Android")
    set(CMAKE_CXX_STANDARD 17)
endif ()


if (CMAKE_SYSTEM_NAME STREQUAL "Android")

endif ()

set(DOM_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../dom)
set(FRAMEWORK_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../framework)
set(LAYOUT_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../layout)

# 添加子模块
if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/framework_platform_android.cmake)
endif ()
include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/framework_core.cmake)
include(${CMAKE_CURRENT_SOURCE_DIR}/../cmake/render_core.cmake)
add_subdirectory(${DOM_DIR} dom)

include_directories(${DOM_DIR}/include)
include_directories(${LAYOUT_DIR})

set(SRC_FILES
        ${FRAMEWORK_CORE_SRC_FILES}
        ${RENDER_CORE_SRC_FILES})

set(LINKED_LIBS
        dom
        ${FRAMEWORK_CORE_DEPS})

if (CMAKE_SYSTEM_NAME STREQUAL "Android")
    set(SRC_FILES ${SRC_FILES}
            ${FRAMEWORK_ANDROID_SRC})
    set(LINKED_LIBS ${LINKED_LIBS}
            ${FRAMEWORK_ANDROID_DEPS}
            -Wl,--gc-sections)
    add_library(
            # Sets the name of the library.
            ${CMAKE_LIBRARY_NAME}

            # Sets the library as a shared library.
            SHARED

            # Provides a relative path to your source file(s).
            # Associated headers in the same location as their source
            # file are automatically included.
            ${SRC_FILES}
    )
    target_link_libraries(${CMAKE_LIBRARY_NAME} ${LINKED_LIBS})
elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
    add_library(
            # Sets the name of the library.
            ${CMAKE_LIBRARY_NAME}

            # Sets the library as a shared library.
            SHARED

            # Provides a relative path to your source file(s).
            # Associated headers in the same location as their source
            # file are automatically included.
            ${SRC_FILES}
            ${DARWIN_HEADERS}
    )
    set_target_properties(${CMAKE_LIBRARY_NAME} PROPERTIES
            FRAMEWORK TRUE
            MACOSX_FRAMEWORK_IDENTIFIER com.tencent.RenderCore
            MACOSX_FRAMEWORK_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/../RenderCore/RenderCore/Info.plist
            PUBLIC_HEADER "${DARWIN_HEADERS}"
            )
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
            ${CMAKE_LIBRARY_NAME}
            tdf_base_common
            dom
            ${LINKED_LIBS}
            ${JSCORE_LIBRARY}
            )
elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
    add_library(
            # Sets the name of the library.
            ${CMAKE_LIBRARY_NAME}

            # Sets the library as a shared library.
            SHARED

            # Provides a relative path to your source file(s).
            # Associated headers in the same location as their source
            # file are automatically included.
            ${SRC_FILES}
            ${DARWIN_HEADERS}
    )
    set_target_properties(${CMAKE_LIBRARY_NAME} PROPERTIES
            FRAMEWORK TRUE
            MACOSX_FRAMEWORK_IDENTIFIER com.tencent.RenderCore
            MACOSX_FRAMEWORK_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/../RenderCore/RenderCore/Info.plist
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
            ${CMAKE_LIBRARY_NAME}
            ${LINKED_LIBS}
            ${JSCORE_LIBRARY}
            )
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")








# region ABI_COMPILE_OPTIONS
set(ABI_COMPILE_OPTIONS
        -fno-rtti)

add_compile_options(${ABI_COMPILE_OPTIONS})

set(JS_ENGINE "V8")
set(JNI_DIR ${FRAMEWORK_DIR}/js/android/src/main/jni)

set(FRAMEWORK_ANDROID_DEPS android log)

set(ENABLE_INSPECTOR true)

# region dependencies
set(INFA_PACKAGES_URL "https://hippy-packages-1258344701.cos.accelerate.myqcloud.com")
set(INFA_PACKAGES_DOMAIN "hippy")

# region v8
if (${JS_ENGINE} STREQUAL "V8")
  get_filename_component(V8_COMPONENT_PATH ${V8_COMPONENT} ABSOLUTE)
  if (EXISTS "${V8_COMPONENT_PATH}/CMakeLists.txt")
    add_subdirectory(${V8_COMPONENT_PATH} ${CMAKE_CURRENT_BINARY_DIR}/third_party/v8)
  else()
    include(FetchContent)
    FetchContent_Declare(V8
            URL "${INFA_PACKAGES_URL}/${INFA_PACKAGES_DOMAIN}/third_party/v8/${V8_COMPONENT}/android-${ANDROID_ARCH_NAME}.tgz")
    FetchContent_MakeAvailable(V8)
  endif()
endif()
# endregion

# region global definitions
if (${ENABLE_INSPECTOR} STREQUAL "true")
    add_definitions("-DENABLE_INSPECTOR")
endif ()
add_definitions("-DOS_ANDROID")
add_definitions("-DANDROID")
# endregion

# region source
if (${ENABLE_INSPECTOR} STREQUAL "true")
    set(FRAMEWORK_CORE_INSPECTOR_DIR ${FRAMEWORK_DIR}/js/core)
    set(FRAMEWORK_INSPECTOR_SRC
            ${FRAMEWORK_CORE_INSPECTOR_DIR}/src/runtime/v8/inspector/v8_channel_impl.cc
            ${FRAMEWORK_CORE_INSPECTOR_DIR}/src/runtime/v8/inspector/v8_inspector_client_impl.cc)
endif ()

message("FRAMEWORK_INSPECTOR_SRC: ${FRAMEWORK_INSPECTOR_SRC}")
# endregion

message("JS_ENGINE:" ${JS_ENGINE})
if (${JS_ENGINE} STREQUAL "V8")
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
    list(APPEND FRAMEWORK_ANDROID_DEPS v8)
    # endregion
    foreach(INCLUDE_DIRECTORY ${V8_INCLUDE_DIRECTORIES})
        include_directories(${INCLUDE_DIRECTORY})
    endforeach()
    foreach(DEFINITION ${V8_DEFINITIONS})
        add_definitions(${DEFINITION})
    endforeach()
elseif (${JS_ENGINE} STREQUAL "JSC")
else ()
    message(FATAL_ERROR "${JS_ENGINE} is not supported")
endif ()

#
# Tencent is pleased to support the open source community by making
# Hippy available.
#
# Copyright (C) 2022 THL A29 Limited, a Tencent company.
# All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

cmake_minimum_required(VERSION 3.14)

project("js_driver")

get_filename_component(PROJECT_ROOT_DIR "${PROJECT_SOURCE_DIR}/../.." REALPATH)

include("${PROJECT_ROOT_DIR}/buildconfig/cmake/GlobalPackagesModule.cmake")
include("${PROJECT_ROOT_DIR}/buildconfig/cmake/compiler_toolchain.cmake")

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 17)

# Ohos系统上，配置本来应该放到生成so对应的build-profile.json5里。
#（externalNativeOptions里arguments项）
# 现在源码集成配置需在app的build-profile.json5里，不方便，所以先放在这里。
# 后续hippy产物的独立后，放到hippy模块的build-profile.json5里。
if (OHOS)
#  set(JS_ENGINE "V8")
  set(V8_COMPONENT "10.6.194")
  set(JS_ENGINE "JSH")
endif ()

# region library
add_library(${PROJECT_NAME} STATIC)
target_include_directories(${PROJECT_NAME} PUBLIC include)
target_compile_options(${PROJECT_NAME} PRIVATE ${COMPILE_OPTIONS})
if (ENABLE_INSPECTOR)
  target_compile_definitions(${PROJECT_NAME} PUBLIC "ENABLE_INSPECTOR")
endif ()
if (V8_WITHOUT_INSPECTOR)
  target_compile_definitions(${PROJECT_NAME} PUBLIC "V8_WITHOUT_INSPECTOR")
endif()
# endregion

# region vm
if ("${JS_ENGINE}" STREQUAL "V8")
  if (NOT TARGET v8)
    if (NOT V8_COMPONENT)
      message(FATAL_ERROR "The V8_COMPONENT variable must be set")
    endif ()
    if ("${CMAKE_SYSTEM_NAME}" STREQUAL "Android")
      set(V8_REMOTE_FILENAME "android-${ANDROID_ARCH_NAME}.tgz")
    elseif ("${CMAKE_SYSTEM_NAME}" STREQUAL "Windows")
      if ("${CMAKE_HOST_SYSTEM_PROCESSOR}" MATCHES "arm")
        set(V8_REMOTE_FILENAME "windows-arm64.zip")
      else()
        if ("${CMAKE_HOST_SYSTEM_PROCESSOR}" MATCHES "x86")
          set(V8_REMOTE_FILENAME "windows-x86.zip")
        else()
          set(V8_REMOTE_FILENAME "windows-x64.zip")
        endif()
      endif()
    elseif ("${CMAKE_SYSTEM_NAME}" STREQUAL "OHOS")
      set(V8_REMOTE_FILENAME "ohos-arm64.tgz")
    elseif ("${CMAKE_SYSTEM_NAME}" STREQUAL "iOS")
      if ("${CMAKE_OSX_ARCHITECTURES}" MATCHES "arm")
        set(V8_REMOTE_FILENAME "ios-arm64.tgz")
      else()
        set(V8_REMOTE_FILENAME "ios-x64.tgz")
      endif()
    elseif("${CMAKE_SYSTEM_NAME}" STREQUAL "Darwin")
      if ("${CMAKE_OSX_ARCHITECTURES}" MATCHES "arm")
        set(V8_REMOTE_FILENAME "darwin-arm64.tgz")
      else()
        set(V8_REMOTE_FILENAME "darwin-x64.tgz")
      endif()
    elseif("${CMAKE_SYSTEM_NAME}" STREQUAL "Linux")
      if ("${CMAKE_HOST_SYSTEM_PROCESSOR}" MATCHES "arm")
        if ("${CMAKE_HOST_SYSTEM_PROCESSOR}" MATCHES "64")
          set(V8_REMOTE_FILENAME "linux-arm64.tgz")
        else()
          set(V8_REMOTE_FILENAME "linux-arm.tgz")
        endif()
      else()
        if ("${CMAKE_HOST_SYSTEM_PROCESSOR}" MATCHES "64")
          set(V8_REMOTE_FILENAME "linux-x64.tgz")
        else()
          set(V8_REMOTE_FILENAME "linux-x86.tgz")
        endif()
      endif()
    else ()
      message(FATAL_ERROR
          "Unsupported system ${CMAKE_SYSTEM_NAME} with ${CMAKE_HOST_SYSTEM_PROCESSOR} architecture")
    endif ()

    InfraPackage_Add(V8
        REMOTE "global_packages/v8/${V8_COMPONENT}/${V8_REMOTE_FILENAME}"
        LOCAL "${V8_COMPONENT}")

    get_target_property(V8_AUX_DEPS v8 INTERFACE_V8_AUX_DEPS)
    if (V8_AUX_DEPS)
      foreach (__item IN LISTS V8_AUX_DEPS)
        add_custom_command(
            TARGET ${PROJECT_NAME} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E
            copy "${__item}" "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
      endforeach ()
    endif ()
  endif ()
  target_link_libraries(${PROJECT_NAME} PUBLIC v8)

  # The following definitions are used by PUBLIC header files
  target_compile_definitions(${PROJECT_NAME} PUBLIC "JS_V8")
  get_target_property(V8_WITHOUT_INSPECTOR v8 INTERFACE_V8_WITHOUT_INSPECTOR)
  if (V8_WITHOUT_INSPECTOR)
    target_compile_definitions(${PROJECT_NAME} PUBLIC "V8_WITHOUT_INSPECTOR")
  endif ()
elseif ("${JS_ENGINE}" STREQUAL "JSC")
  target_compile_definitions(${PROJECT_NAME} PUBLIC "JS_JSC")
elseif ("${JS_ENGINE}" STREQUAL "JSH")
  target_compile_definitions(${PROJECT_NAME} PUBLIC "JS_JSH")
endif ()
# endregion

# region footstone
if (OHOS)
  GlobalPackages_Add_footstone()
else ()
  GlobalPackages_Add(footstone)
endif ()
target_link_libraries(${PROJECT_NAME} PRIVATE footstone)
# endregion

# region vfs
if (OHOS)
  GlobalPackages_Add_vfs()
else ()
  GlobalPackages_Add(vfs)
endif ()
# Just reference the `dom` header files, no library needed
target_include_directories(${PROJECT_NAME} PRIVATE $<TARGET_PROPERTY:vfs,INTERFACE_INCLUDE_DIRECTORIES>)
# endregion

# region dom
if (OHOS)
  GlobalPackages_Add_dom()
else ()
  GlobalPackages_Add(dom)
endif ()
target_link_libraries(${PROJECT_NAME} PRIVATE dom)
# endregion

# region devtools
if (ENABLE_INSPECTOR)
if (OHOS)
  GlobalPackages_Add_devtools_backend()
else ()
  GlobalPackages_Add(devtools_backend)
endif ()
  target_link_libraries(${PROJECT_NAME} PUBLIC devtools_backend)
if (OHOS)
  GlobalPackages_Add_devtools_integration()
else ()
  GlobalPackages_Add(devtools_integration)
endif ()
  target_link_libraries(${PROJECT_NAME} PUBLIC devtools_integration)
endif ()
# endregion

# region source set
set(SOURCE_SET
    src/base/js_convert_utils.cc
    src/base/js_value_wrapper.cc
    src/engine.cc
    src/js_driver_utils.cc
    src/modules/animation_frame_module.cc
    src/modules/animation_module.cc
    src/modules/event_module.cc
    src/modules/scene_builder_module.cc
    src/napi/callback_info.cc
    src/performance/performance.cc
    src/performance/performance_entry.cc
    src/performance/performance_frame_timing.cc
    src/performance/performance_mark.cc
    src/performance/performance_measure.cc
    src/performance/performance_navigation_timing.cc
    src/performance/performance_paint_timing.cc
    src/performance/performance_resource_timing.cc
    src/scope.cc
    src/vm/js_vm.cc)
if ("${JS_ENGINE}" STREQUAL "V8")
  list(APPEND SOURCE_SET
          src/napi/v8/v8_ctx.cc
          src/napi/v8/v8_class_definition.cc
          src/napi/v8/v8_try_catch.cc
          src/vm/v8/interrupt_queue.cc
          src/vm/v8/memory_module.cc
          src/vm/v8/native_source_code_android.cc
          src/vm/v8/serializer.cc
          src/vm/v8/v8_vm.cc)

  set_source_files_properties(src/vm/v8/serializer.cc PROPERTIES COMPILE_FLAGS -fno-rtti)

  if (NOT V8_WITHOUT_INSPECTOR)
    list(APPEND SOURCE_SET
            src/vm/v8/inspector/v8_channel_impl.cc
            src/vm/v8/inspector/v8_inspector_client_impl.cc)
  endif ()
elseif ("${JS_ENGINE}" STREQUAL "JSC")
  list(APPEND SOURCE_SET
          src/napi/jsc/jsc_class_definition.cc
          src/napi/jsc/jsc_ctx.cc
          src/napi/jsc/jsc_try_catch.cc
          src/vm/jsc/jsc_vm.cc
          src/vm/jsc/native_source_code_ios.cc)
elseif ("${JS_ENGINE}" STREQUAL "JSH")
  list(APPEND SOURCE_SET
            src/napi/jsh/jsh_class_definition.cc
            src/napi/jsh/jsh_ctx.cc
            src/napi/jsh/jsh_try_catch.cc
            src/vm/jsh/jsh_vm.cc
            src/vm/jsh/native_source_code_ohos.cc)
endif ()
set(SOURCE_SET_STANDALONE
        src/modules/console_module.cc
        src/modules/contextify_module.cc
        src/modules/performance/performance_entry_module.cc
        src/modules/performance/performance_frame_timing_module.cc
        src/modules/performance/performance_mark_module.cc
        src/modules/performance/performance_measure_module.cc
        src/modules/performance/performance_module.cc
        src/modules/performance/performance_navigation_timing_module.cc
        src/modules/performance/performance_paint_timing_module.cc
        src/modules/performance/performance_resource_timing_module.cc
        src/modules/timer_module.cc
        src/modules/ui_manager_module.cc
        src/modules/ui_layout_module.cc)
target_sources(${PROJECT_NAME} PRIVATE ${SOURCE_SET})
# The linker treats `.a` and `.o` files are different:
#   * `.o` files from `.a` file only referenced `.o` object files are linked.
#   * `.o` files in the linker always go inside, referenced or not.
#
# The `SOURCE_SET_STANDALONE` including static initializers,
# so its visibility must be PUBLIC.
target_sources(${PROJECT_NAME} PUBLIC ${SOURCE_SET_STANDALONE})
# endregion

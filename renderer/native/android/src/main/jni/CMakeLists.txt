set(LIB_NAME "native_render")

project("native_render")

get_filename_component(PROJECT_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../.." REALPATH)
get_filename_component(JNI_DIR "${PROJECT_ROOT_DIR}/framework/js/android/src/main/jni" REALPATH)
get_filename_component(DOM_DIR "${PROJECT_ROOT_DIR}/dom" REALPATH)
get_filename_component(LAYOUT_DIR "${PROJECT_ROOT_DIR}/layout" REALPATH)
get_filename_component(CORE_SRC_DIR "${PROJECT_ROOT_DIR}/framework/js/core" REALPATH)
get_filename_component(V8_SRC_DIR "${PROJECT_ROOT_DIR}/framework/js/android/src/main/jni/${V8_COMPONENT}" REALPATH)
get_filename_component(DEVTOOLS_DIR "${PROJECT_ROOT_DIR}/third_party/devtools-backend" REALPATH)

include_directories(${DOM_DIR}/include)
include_directories(${JNI_DIR}/include)
include_directories(${CORE_SRC_DIR}/include)
include_directories(${CORE_SRC_DIR}/third_party/base/include)
include_directories(${LAYOUT_DIR})
include_directories(${V8_SRC_DIR}/include)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

file(GLOB_RECURSE SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/**)

message("SRC_FILES:" ${SRC_FILES})

add_definitions("-DOS_ANDROID")
add_definitions("-DANDROID")

if (DEFINED TDF_SERVICE_ENABLED)
  add_definitions(-DTDF_SERVICE_ENABLED=1)
  include_directories(${DEVTOOLS_DIR}/include)
  include_directories(${DEVTOOLS_DIR}/third_party/footstone/include)
  include_directories(${DEVTOOLS_DIR}/third_party/footstone/third_party/json/include)
  include_directories(${V8_SRC_DIR}/include/v8)
endif ()

set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib/render)
add_library(${LIB_NAME} STATIC ${SRC_FILES})
target_link_libraries(${LIB_NAME})
set_property(TARGET ${LIB_NAME} PROPERTY CXX_STANDARD 17)

if (DEFINED TDF_SERVICE_ENABLED)
  add_library(DEVTOOLS_SO SHARED IMPORTED)
  set_target_properties(DEVTOOLS_SO PROPERTIES IMPORTED_LOCATION ${DEVTOOLS_DIR}/libs/android/${ANDROID_ABI}/libdevtools_backend.so)
  target_link_libraries(${LIB_NAME} DEVTOOLS_SO)
endif ()

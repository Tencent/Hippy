cmake_minimum_required(VERSION 3.4.1)

set(CMAKE_VERBOSE_MAKEFILE on)
add_compile_options(
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
	-fvisibility=hidden
	-pipe
	-fPIC
	-Wno-unused-local-typedefs
	-march=armv7-a
	-mtune=generic-armv7-a
	-mfpu=vfpv3-d16
	-mfloat-abi=softfp
	-mthumb
	-ffunction-sections
	-funwind-tables
	-fstack-protector
	-fno-short-enums
	-Os
	-g
	-fdata-sections
	-ffunction-sections
	-fomit-frame-pointer )

add_definitions("-DOS_ANDROID")

file(GLOB_RECURSE jni_src ../*.cc)
file(GLOB_RECURSE jsc_src ../core/napi/jsc/*)
list(REMOVE_ITEM jni_src ${jsc_src})
message("jni-src-list: ${jni_src}")

set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} -s")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -s")

set(LIBBRIDGE_INCLUDE_DIR ../)
set(LIBBRIDGE_INCLUDE_DIR_2 ../core)
set(LIBV8_INCLUDE_DIR ../jni/third_party/v8)
set(LIBV8_INCLUDE_DIR_2 ../jni/third_party/v8/libplatform)

include_directories(${LIBV8_INCLUDE_DIR} ${LIBV8_INCLUDE_DIR_2} ${LIBBRIDGE_INCLUDE_DIR} ${LIBBRIDGE_INCLUDE_DIR_2})

#libmttv8 SHARED；静态库为STATIC
add_library(libmttv8 SHARED IMPORTED)
#对应so目录，注意要先 add_library，再 set_target_properties）
set_target_properties(libmttv8 PROPERTIES IMPORTED_LOCATION ${PROJECT_SOURCE_DIR}/../third_party/v8/armeabi-v7a/libmttv8.so)

#libmtt_shared SHARED；静态库为STATIC
add_library(libmtt_shared SHARED IMPORTED)
#对应so目录，注意要先 add_library，再 set_target_properties）
set_target_properties(libmtt_shared PROPERTIES IMPORTED_LOCATION ${PROJECT_SOURCE_DIR}/../third_party/v8/armeabi-v7a/libmtt_shared.so)

add_library(hippybridge SHARED ${jni_src})

#add_library(mtt_shared SHARED IMPORTED)
#set_target_properties(mtt_shared PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libmtt_shared.so)

#target_link_libraries(flexbox android c++_shared log)
#for stablility, not use LLVM libc++ runtime: libc++_shared.so
target_link_libraries(hippybridge android log libmttv8 libmtt_shared)

set(CMAKE_CXX_FLAGS_RELEASE "-O2 -DNDEBUG " )   # release包优化

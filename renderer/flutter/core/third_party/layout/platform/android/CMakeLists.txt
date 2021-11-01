cmake_minimum_required(VERSION 3.4.1)

set(CMAKE_VERBOSE_MAKEFILE on)
add_compile_options(
	-fno-rtti
	-fno-threadsafe-statics
	-std=c++11
	--param=ssp-buffer-size=4
	-Werror
	-fno-exceptions
	-fno-strict-aliasing
	-Wall
	-Wno-unused-parameter
	-Wno-missing-field-initializers
	-pipe
	-fPIC
	-Wno-unused-local-typedefs
	-ffunction-sections
	-funwind-tables
	-fstack-protector
	-fno-short-enums
	-Os
	-g
	-fdata-sections
	-ffunction-sections
	-fomit-frame-pointer )

file(GLOB engine_src ../engine/*.cpp)
message(layout-engine-src-list: "${engine_src}")

file(GLOB ffi_src ../ffi/*.cpp)
message(layout-ffi-src-list: "${ffi_src}")

file(GLOB taitank_src ../taitank/*.cc)
message(layout-taitank-src-list: "${taitank_src}")

set(ENGINE_INCLUDE_DIR ${engine_src})

set(FFI_INCLUDE_DIR ${ffi_src})

set(TAITANK_INCLUDE_DIR ${ffi_src})

include_directories(${ENGINE_INCLUDE_DIR} ${FFI_INCLUDE_DIR} ${TAITANK_INCLUDE_DIR})

add_library(flexbox SHARED ${engine_src} ${taitank_src} ${ffi_src})

add_library(mtt_shared SHARED IMPORTED)

set_target_properties(mtt_shared PROPERTIES IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/libs/${ANDROID_ABI}/libmtt_shared.so)

target_link_libraries(flexbox android mtt_shared log)
#for stablility, not use LLVM libc++ runtime: libc++_shared.so
#target_link_libraries(flexbox android c++_shared log)

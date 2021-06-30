cmake_minimum_required(VERSION 3.4.1)

project(flexbox)

set(CMAKE_VERBOSE_MAKEFILE on)
add_compile_options(
	-fno-rtti
	-fno-threadsafe-statics
	-fvisibility-inlines-hidden
	-std=c++11
	--param=ssp-buffer-size=4
	-Werror
	-fno-exceptions
	-fno-strict-aliasing
	-Wall
	-Wno-unused-parameter
	-Wno-missing-field-initializers
	-fvisibility=hidden
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
file(GLOB jni_src jni/*.cpp)

add_library(flexbox SHARED ${engine_src} ${jni_src})

target_link_libraries(flexbox android log)

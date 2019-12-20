cmake_minimum_required(VERSION 3.4.1)

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
message( engine src list: "${engine_src}")

file(GLOB jni_src jni/*.cpp) 
message( jni src list: "${jni_src}")


add_library(flexbox SHARED ${engine_src} ${jni_src})


add_library(mtt_shared SHARED IMPORTED)

set_target_properties(mtt_shared PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libs/${ANDROID_ABI}/libmtt_shared.so)

target_link_libraries(flexbox android mtt_shared log)
#for stablility, not use LLVM libc++ runtime: libc++_shared.so
#target_link_libraries(flexbox android c++_shared log)

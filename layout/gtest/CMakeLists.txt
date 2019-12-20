cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_VERBOSE_MAKEFILE on)
project(GTEST_HIPPY_LAYOUT)

add_compile_options(
	-fno-rtti
	-std=c++11
	-Werror
	-fno-exceptions
	 )

file(GLOB engine_src ../engine/*.cpp)
message( engine_src list: "${engine_src}")
file(GLOB tests_src ./tests/*.cpp) 
message( tests_src list: "${tests_src}")
file(GLOB gtest_src ./*.cc) 
message( gtest_src list: "${gtest_src}")


add_executable(gtest_hippy_layout ${engine_src} ${tests_src}  ${gtest_src})
target_include_directories(gtest_hippy_layout PRIVATE ./ ../engine ./tests)
target_link_libraries(gtest_hippy_layout pthread)

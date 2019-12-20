cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_VERBOSE_MAKEFILE on)
project(BENCHMARK_HIPPY_LAYOUT)

add_compile_options(
	-fno-rtti
	-std=c++11
    -O2
    -g
	-Wall
    -c
    -fmessage-length=0
	-fno-exceptions
	 )

file(GLOB engine_src ../../engine/*.cpp)
message( engine_src list: "${engine_src}")
file(GLOB benchmark_src ./HPBenchmark.cpp) 



add_executable(hippy_layout_benchmark ${engine_src} ${benchmark_src})
target_include_directories(hippy_layout_benchmark PRIVATE ./ ../../engine)
target_link_libraries(hippy_layout_benchmark pthread)

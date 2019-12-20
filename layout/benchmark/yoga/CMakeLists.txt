cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_VERBOSE_MAKEFILE on)
set(YOGA_DOWNLOAD_URL "https://codeload.github.com/facebook/yoga/zip/master")
set(YOGA_MASTER_ZIP ${CMAKE_SOURCE_DIR}/../../out/yogabenchmark/yoga-master.zip)
set(YOGA_SRC ${CMAKE_SOURCE_DIR}/../../out/yogabenchmark/yoga-master)
set(YOGA_ENGINE_SRC ${CMAKE_SOURCE_DIR}/../../out/yogabenchmark/yoga-master/yoga)

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

file(DOWNLOAD 
	 ${YOGA_DOWNLOAD_URL}
     ${YOGA_MASTER_ZIP}
     SHOW_PROGRESS
	)

execute_process(
    COMMAND unzip -o ${YOGA_MASTER_ZIP}
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/../../out/yogabenchmark/
	)

file(GLOB_RECURSE yoga_engine_src ${YOGA_ENGINE_SRC}/*.cpp)
message( yoga_engine_src list: "${yoga_engine_src}")
file(GLOB yoga_benchmark_src ./YGBenchmark.cpp) 

add_executable(yoga_layout_benchmark ${yoga_engine_src} ${yoga_benchmark_src})
target_include_directories(yoga_layout_benchmark PRIVATE ${YOGA_ENGINE_SRC} ${YOGA_SRC})
target_link_libraries(yoga_layout_benchmark pthread)


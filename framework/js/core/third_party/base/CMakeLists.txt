cmake_minimum_required(VERSION 3.4.1)

project(base)

include_directories(
        include
)
set(TDF_BASE_SOURCE_DIR .)
add_subdirectory(src)
#add_subdirectory(test)

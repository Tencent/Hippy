cmake_minimum_required(VERSION 2.8)
project(footstone)
set(CMAKE_CXX_STANDARD 17)
set(FOOTSTONE_PATH ${CMAKE_CURRENT_SOURCE_DIR})
set(THIRD_PARTY ${CMAKE_CURRENT_SOURCE_DIR}/third_party)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)
add_subdirectory(src)
#add_subdirectory(test)

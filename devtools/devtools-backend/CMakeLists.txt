cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_CXX_STANDARD 17)
set(PROJECT_NAME devtools_backend)
project(${PROJECT_NAME})
message("使用build.sh来生成库，该camkelist可进行源码引入")


set(WEBSOCKETPP_PATH ${CMAKE_CURRENT_SOURCE_DIR}/third_party/websocketpp)
set(ASIO_PATH ${CMAKE_CURRENT_SOURCE_DIR}/third_party/asio/include)
include_directories(${WEBSOCKETPP_PATH} ${ASIO_PATH})

add_compile_options(-frtti)

if(ANDROID)
    add_subdirectory(cmake/android)
elseif(IOS)
    add_subdirectory(cmake/ios)
elseif (APPLE)
    add_subdirectory("${CMAKE_CURRENT_SOURCE_DIR}/test" unit_test)
endif()

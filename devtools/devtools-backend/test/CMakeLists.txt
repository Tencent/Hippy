cmake_minimum_required(VERSION 3.4.1)
project(unit_test)
set(CMAKE_CXX_STANDARD 17)

set(BACKEND_ROOT_DIR ..)
set(THIRD_PARTY ${BACKEND_ROOT_DIR}/third_party)
#add include directories
set(BACKEND_INCLUDE_DIR
        ${BACKEND_ROOT_DIR}/include)

include_directories(${BACKEND_INCLUDE_DIR})

set(WEBSOCKETPP_PATH ${THIRD_PARTY}/websocketpp)
set(ASIO_PATH ${THIRD_PARTY}/asio/include)
include_directories(${WEBSOCKETPP_PATH} ${ASIO_PATH})

include_directories(${THIRD_PARTY}/nlohmann)

#add library
file(GLOB_RECURSE ALL_SOURCE_FILE
        ${BACKEND_ROOT_DIR}/src/**)

file(GLOB_RECURSE SRC_FILES ./**/*.cc *.cc)

add_executable(unit_test ${SRC_FILES} ${ALL_SOURCE_FILE})  #待修改

if (ANDROID)
    message("platform = android")
elseif (IOS)
    message("platform = ios")
elseif (APPLE)
    add_definitions(-DOS_MACOSX)
    message("platform = macos")
    target_link_libraries("unit_test"
            "-framework CoreFoundation"
            "-framework CoreText"
            "-framework Cocoa"
            "-framework Metal")
else ()
    message("platform = else")
endif ()

find_package(GTest)
if(GTest_FOUND)
    include_directories(${GTEST_INCLUDE_DIRS})
    target_link_libraries(unit_test
            ${CMAKE_THREAD_LIBS_INIT}
            ${GTEST_LIBRARIES})
else(GTest_FOUND)
    add_subdirectory(${THIRD_PARTY}/googletest gtest)
    include_directories(${gtest_SOURCE_DIR}/include ${gtest_SOURCE_DIR})
    include_directories(${gmock_SOURCE_DIR}/include ${gmock_SOURCE_DIR})
    target_link_libraries(unit_test
            gtest
            gmock
            ${CMAKE_THREAD_LIBS_INIT})
endif(GTest_FOUND)

SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --coverage")

enable_testing()

add_test(NAME backend_unit_test COMMAND unit_test)

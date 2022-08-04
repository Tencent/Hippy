# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.23.2)

# We name the project and the target for the ExternalProject_Add() call
# to something that will highlight to the user what we are working on if
# something goes wrong and an error message is produced.

project(asio-populate NONE)



include(ExternalProject)
ExternalProject_Add(asio-populate
                     "UPDATE_DISCONNECTED" "False" "URL" "https://infra-packages.openhippy.com/hippy/devtools/backend/third_party/asio/1.22.1/asio.tar.gz"
                    SOURCE_DIR          "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-src"
                    BINARY_DIR          "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-build"
                    CONFIGURE_COMMAND   ""
                    BUILD_COMMAND       ""
                    INSTALL_COMMAND     ""
                    TEST_COMMAND        ""
                    USES_TERMINAL_DOWNLOAD  YES
                    USES_TERMINAL_UPDATE    YES
                    USES_TERMINAL_PATCH     YES
)



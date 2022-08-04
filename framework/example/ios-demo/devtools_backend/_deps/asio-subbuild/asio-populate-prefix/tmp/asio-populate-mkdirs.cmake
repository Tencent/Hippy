# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-src"
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-build"
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-subbuild/asio-populate-prefix"
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-subbuild/asio-populate-prefix/tmp"
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-subbuild/asio-populate-prefix/src/asio-populate-stamp"
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-subbuild/asio-populate-prefix/src"
  "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-subbuild/asio-populate-prefix/src/asio-populate-stamp"
)

set(configSubDirs Debug;Release;MinSizeRel;RelWithDebInfo)
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/asio-subbuild/asio-populate-prefix/src/asio-populate-stamp/${subDir}")
endforeach()

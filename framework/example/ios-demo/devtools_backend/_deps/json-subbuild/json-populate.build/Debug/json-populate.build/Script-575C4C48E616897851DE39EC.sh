#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/download-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/verify-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/extract-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/json-populate-download
fi
if test "$CONFIGURATION" = "Release"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/download-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/verify-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/extract-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/json-populate-download
fi
if test "$CONFIGURATION" = "MinSizeRel"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/download-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/verify-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/extract-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/json-populate-download
fi
if test "$CONFIGURATION" = "RelWithDebInfo"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/download-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/verify-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -P /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/extract-json-populate.cmake
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/json-subbuild/json-populate-prefix/src/json-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/json-populate-download
fi


#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-build
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E echo_append
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-subbuild/websocketpp-populate-prefix/src/websocketpp-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/websocketpp-populate-install
fi
if test "$CONFIGURATION" = "Release"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-build
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E echo_append
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-subbuild/websocketpp-populate-prefix/src/websocketpp-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/websocketpp-populate-install
fi
if test "$CONFIGURATION" = "MinSizeRel"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-build
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E echo_append
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-subbuild/websocketpp-populate-prefix/src/websocketpp-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/websocketpp-populate-install
fi
if test "$CONFIGURATION" = "RelWithDebInfo"; then :
  cd /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-build
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E echo_append
  /usr/local/Cellar/cmake/3.23.2/bin/cmake -E touch /Users/mengyanluo/work_project/HippyCode/GithubHippy_3.0/framework/example/ios-demo/devtools_backend/_deps/websocketpp-subbuild/websocketpp-populate-prefix/src/websocketpp-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/websocketpp-populate-install
fi


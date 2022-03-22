#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend
  make -f /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend/CMakeScripts/ReRunCMake.make
fi
if test "$CONFIGURATION" = "Release"; then :
  cd /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend
  make -f /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend/CMakeScripts/ReRunCMake.make
fi
if test "$CONFIGURATION" = "MinSizeRel"; then :
  cd /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend
  make -f /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend/CMakeScripts/ReRunCMake.make
fi
if test "$CONFIGURATION" = "RelWithDebInfo"; then :
  cd /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend
  make -f /Users/tangtang/Developer/ThomasHippy/Hippy/framework/js/examples/ios-demo/devtools_backend/CMakeScripts/ReRunCMake.make
fi


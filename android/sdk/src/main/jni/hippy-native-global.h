
#ifndef HIPPY_NATIVE_GLOBAL_H_
#define HIPPY_NATIVE_GLOBAL_H_

#include <iostream>
#include <string>

#include "runtime.h"  // NOLINT(build/include_subdir)

class JNIEnvironment;

class HippyNativeGlobal {
 public:
  HippyNativeGlobal() = delete;

 public:
  static void registerGlobal(const char* char_globalConfig,
                      V8Runtime* runtime);
};

#endif  // HIPPY_NATIVE_GLOBAL_H_

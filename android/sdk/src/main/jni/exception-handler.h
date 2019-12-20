//
// Created by howlpan on 2019/4/18.
//

#ifndef EXCEPTION_HANDLER_H_
#define EXCEPTION_HANDLER_H_

#include <iostream>
#include <sstream>
#include "runtime.h"  // NOLINT(build/include_subdir)

class JNIEnvironment;

class ExceptionHandler {
 public:
  ExceptionHandler() = default;
  ~ExceptionHandler() = default;

 public:
  static void reportJsException(v8::Isolate* isolate,
                                std::stringstream& description_stream,
                                std::stringstream& stack_stream);

  void JSONException(V8Runtime* runtime,
                     const char* jsonValue);
};

#endif  // EXCEPTION_HANDLER_H_

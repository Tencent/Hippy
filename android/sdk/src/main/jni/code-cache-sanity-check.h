//
// Created by howlpan on 2019/4/18.
//

#ifndef CODE_CACHE_SANITY_CHECK_H_
#define CODE_CACHE_SANITY_CHECK_H_

#include "third_party/v8/v8.h"

class JNIEnvironment;

class CodeCacheSanityCheck {
 public:
  CodeCacheSanityCheck() = default;
  ~CodeCacheSanityCheck() = default;

 public:
  static void check(v8::Isolate* isolate, int result, v8::Local<v8::String> source);
};

#endif  // CODE_CACHE_SANITY_CHECK_H_

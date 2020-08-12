//
// Created by howlpan on 2019/4/17.
//

#ifndef JNI_UTILS_H_
#define JNI_UTILS_H_

#include <jni.h>
#include <string>

#include "third_party/v8/v8.h"

struct HippyBuffer;

class JniUtils {
 public:
  JniUtils() = default;
  ~JniUtils() = default;

 public:
  static std::string ConvertJByteArrayToString(JNIEnv* env, jbyteArray byteArray, jint offset,
                                               jint length);
  char* CopyCharToChar(const char* source_char);
  HippyBuffer* writeToBuffer(v8::Isolate* isolate, v8::Local<v8::Object> value);

  static inline const char* ToCString(const v8::String::Utf8Value& value) {
    return *value ? *value : "<string conversion failed>";
  }

  static void printCurrentThreadID();
};

#endif  // JNI_UTILS_H_

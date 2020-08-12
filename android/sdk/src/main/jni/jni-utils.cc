//
// Created by howlpan on 2019/4/17.
//
#include "jni-utils.h"  // NOLINT(build/include_subdir)

#include <android/log.h>
#include <stdlib.h>
#include <string.h>

#include "hippy-buffer.h"  // NOLINT(build/include_subdir)

std::string JniUtils::ConvertJByteArrayToString(JNIEnv* env, jbyteArray byteArray,
                                                jint offset, jint length) {
  std::string ret;

  jbyte* bytes = env->GetByteArrayElements(byteArray, nullptr);
  if (!bytes)
    return ret;

  int len = length ? length : env->GetArrayLength(byteArray);
  len -= offset;
  if (len > 0)
    ret = std::string((char*)bytes + offset, len);

  env->ReleaseByteArrayElements(byteArray, bytes, 0);

  return ret;
}

char* JniUtils::CopyCharToChar(const char* source_char) {
  if (source_char == NULL) {
    return NULL;
  }
  char* temp_char = NULL;
  int source_char_length = strlen(source_char);
  temp_char = (char*)malloc(source_char_length + 1);
  memcpy(temp_char, source_char, source_char_length);
  temp_char[source_char_length] = 0;

  return temp_char;
}

HippyBuffer* JniUtils::writeToBuffer(v8::Isolate* isolate,
                                     v8::Local<v8::Object> value) {
  HippyBuffer* buffer = newBuffer();
  buildBuffer(isolate, value, buffer);
  return buffer;
}

void JniUtils::printCurrentThreadID() {
#define LOG_DEBUG(FORMAT, ...) \
  __android_log_print(ANDROID_LOG_DEBUG, "Debug", FORMAT, ##__VA_ARGS__);

  /*auto myid = WorkerThread::getCurrentThreadId();
  std::stringstream ss;
  ss << myid;
  std::string threadId = ss.str();
 // napi_print_log("threadId: ");
  char* log = (char*)threadId.c_str();
  LOG_DEBUG("current threadid: %s", log);*/
}

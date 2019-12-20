//
// Created by howlpan on 2019/4/17.
//

#ifndef JNI_ENV_H_
#define JNI_ENV_H_

#include <jni.h>

#include "core/base/macros.h"

class JNIEnvironment {
 public:
  typedef struct jmethodID_wrapper_ {
    explicit jmethodID_wrapper_() {
      callNativesMethodID = nullptr;
      reportExceptionMethodID = nullptr;
      postCodeCacheRunnableMethodID = nullptr;
      deleteCodeCacheMethodID = nullptr;
      inspectorChannelMethodID = nullptr;
    }

    jmethodID callNativesMethodID;
    jmethodID reportExceptionMethodID;
    jmethodID postCodeCacheRunnableMethodID;
    jmethodID deleteCodeCacheMethodID;
    jmethodID inspectorChannelMethodID;
  } JemthodID_Wrapper;

 public:
  JNIEnvironment() = default;
  ~JNIEnvironment() = default;

  void init(JavaVM* vm, JNIEnv* env);

  static bool clearJEnvException(JNIEnv* env);
  static JNIEnvironment* getInstance();
  static void destroyInstance();
  static JNIEnv* AttachCurrentThread();
  static void DetachCurrentThread();

 public:
  JavaVM* jvm;
  JemthodID_Wrapper wrapper;
};
/*
class JNIEnvPtr {
 public:
  JNIEnvPtr();
  ~JNIEnvPtr();

  inline JNIEnv* operator->() { return env_; }

  inline JNIEnv* env() { return env_; }

 private:
  JNIEnv* env_ = nullptr;
  bool need_detach_ = false;

  DISALLOW_COPY_AND_ASSIGN(JNIEnvPtr);
};
*/
#endif  // JNI_ENV_H_

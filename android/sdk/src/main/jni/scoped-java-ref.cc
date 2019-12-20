//
// Created by howlpan on 2019/6/20.
//

#include "scoped-java-ref.h"

#include "jni-env.h"
#include "core/base/logging.h"

JavaRef::JavaRef(JNIEnv* env, jobject obj) : obj_(nullptr) {
  SetNewGlobalRef(env, obj);
}

JavaRef::~JavaRef() {
  ResetGlobalRef();
}

void JavaRef::SetNewGlobalRef(JNIEnv* env, jobject obj) {
  if (!env) {
    env = JNIEnvironment::AttachCurrentThread();
  } else {
    HIPPY_DCHECK(env == JNIEnvironment::AttachCurrentThread());
  }

  if (obj) obj = env->NewGlobalRef(obj);
  if (obj_) env->DeleteGlobalRef(obj_);

  obj_ = obj;
}

void JavaRef::ResetGlobalRef() {
  if (obj_) {
    JNIEnvironment::AttachCurrentThread()->DeleteGlobalRef(obj_);
    obj_ = nullptr;
  }
}
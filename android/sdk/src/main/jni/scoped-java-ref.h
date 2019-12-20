//
// Created by howlpan on 2019/6/20.
//

#ifndef ANDROID_HIPPY_SCOPED_JAVA_REF_H
#define ANDROID_HIPPY_SCOPED_JAVA_REF_H

#include <jni.h>

#include "core/base/macros.h"

class JavaRef {
 public:
   JavaRef(JNIEnv* env, jobject obj);
   ~JavaRef();

   void SetNewGlobalRef(JNIEnv* env, jobject obj);
   void ResetGlobalRef();
   jobject obj() { return obj_; }
 private:
   jobject obj_;

   DISALLOW_COPY_AND_ASSIGN(JavaRef);
};
#endif //ANDROID_HIPPY_SCOPED_JAVA_REF_H

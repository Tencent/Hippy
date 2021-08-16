/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "scoped-java-ref.h"

#include "core/base/logging.h"
#include "jni-env.h"

JavaRef::JavaRef(JNIEnv* env, jobject obj) : obj_(nullptr) {
  // HIPPY_DLOG(hippy::Debug, "JavaRef create");
  if (!env) {
    env = JNIEnvironment::AttachCurrentThread();
  } else {
    HIPPY_DCHECK(env == JNIEnvironment::AttachCurrentThread());
  }

  if (obj) {
    obj_ = env->NewGlobalRef(obj);
  }
}

JavaRef::~JavaRef() {
  // HIPPY_DLOG(hippy::Debug, "~JavaRef release");
  if (obj_) {
    JNIEnvironment::AttachCurrentThread()->DeleteGlobalRef(obj_);
  }
}

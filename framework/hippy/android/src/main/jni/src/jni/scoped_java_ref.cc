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

#include "jni/scoped_java_ref.h"

#include "core/core.h"
#include "jni/jni_env.h"

JavaRef::JavaRef(JNIEnv* j_env, jobject j_obj) : obj_(nullptr) {
  // TDF_BASE_DLOG(INFO) <<  "JavaRef create";
  if (!j_env) {
    j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  } else {
    TDF_BASE_DCHECK(j_env ==
                    JNIEnvironment::GetInstance()->AttachCurrentThread());
  }

  if (j_obj) {
    obj_ = j_env->NewGlobalRef(j_obj);
  }
}

JavaRef::~JavaRef() {
  // TDF_BASE_DLOG(INFO) <<  "~JavaRef release";
  if (obj_) {
    JNIEnvironment::GetInstance()->AttachCurrentThread()->DeleteGlobalRef(obj_);
  }
}

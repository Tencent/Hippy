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

#include "jni-utils.h"  // NOLINT(build/include_subdir)

#include <android/log.h>
#include <stdlib.h>
#include <string.h>

#include "core/base/logging.h"
#include "hippy-buffer.h"  // NOLINT(build/include_subdir)

size_t SafeGetArrayLength(JNIEnv* env, const jbyteArray& jarray) {
  HIPPY_DCHECK(jarray);
  jsize length = env->GetArrayLength(jarray);
  HIPPY_DCHECK(length > 0);
  return static_cast<size_t>(std::max(0, length));
}

void JniUtils::AppendJavaByteArrayToByteVector(
    JNIEnv* env,
    jbyteArray byte_array,
    std::shared_ptr<std::vector<uint8_t>> out) {
  HIPPY_DCHECK(out);
  if (!byte_array)
    return;
  size_t len = SafeGetArrayLength(env, byte_array);
  if (!len)
    return;
  size_t back = out->size();
  out->resize(back + len);
  env->GetByteArrayRegion(byte_array, 0, len,
                          reinterpret_cast<int8_t*>(out->data() + back));
}

// todo
// ��ʱֻ�м��ַ���û�����ĵȵĳ�����ΪЧ�ʺͰ���С���ǣ�������utf16��utf8��ת��
std::string JniUtils::CovertJavaStringToString(JNIEnv* env, jstring str) {
  HIPPY_DCHECK(str);

  const char* c_str = env->GetStringUTFChars(str, NULL);
  const int len = env->GetStringLength(str);
  std::string ret(c_str, len);
  env->ReleaseStringUTFChars(str, c_str);
  return ret;
}

HippyBuffer* JniUtils::WriteToBuffer(v8::Isolate* isolate,
                                     v8::Local<v8::Object> value) {
  HippyBuffer* buffer = NewBuffer();
  BuildBuffer(isolate, value, buffer);
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

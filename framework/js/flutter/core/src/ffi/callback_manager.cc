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

#include "ffi/callback_manager.h"

Dart_PostCObjectType dartPostCObject = NULL;
Dart_Port callbackPort = 0;

EXTERN_C void VoltronRegisterDartPostCObject(Dart_PostCObjectType _dartPostCObject, int64_t port) {
  dartPostCObject = _dartPostCObject;
  callbackPort = port;
}

EXTERN_C void VoltronExecuteCallback(Work* work_ptr) {
  const Work work = *work_ptr;
  work();
  delete work_ptr;
}

bool PostWorkToDart(const Work* work) {
  if (callbackPort != 0) {
    const auto workAddress = reinterpret_cast<intptr_t>(work);
    Dart_CObject dart_object;
    dart_object.type = Dart_CObject_kInt64;
    dart_object.value.as_int64 = workAddress;

    const bool result = dartPostCObject(callbackPort, &dart_object);
    return result;
  }
  return false;
}

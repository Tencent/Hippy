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

#include "callback_manager.h"

#include "ffi_define.h"
#include "footstone/logging.h"
#include "footstone/check.h"

dart_post_c_object_type dart_post_c_object_ = NULL;
Dart_Port callback_port = 0;

void VoltronRegisterDartPostCObject(dart_post_c_object_type dart_post_c_object, int64_t port) {
  dart_post_c_object_ = dart_post_c_object;
  callback_port = port;
}

EXTERN_C void VoltronExecuteCallback(Work *work_ptr) {
  const Work work = *work_ptr;
  work();
  delete work_ptr;
}

bool PostWorkToDart(const Work *work) {
  if (callback_port != 0) {
    const auto workAddress = reinterpret_cast<intptr_t>(work);
    Dart_CObject dart_object;
    dart_object.type = Dart_CObject_kInt64;
    dart_object.value.as_int64 = workAddress;

    const bool result = dart_post_c_object_(callback_port, &dart_object);
    return result;
  }
  return false;
}

bool CallGlobalCallback(int32_t callback_id, int64_t value) {
  if (global_callback_func) {
    const Work work = [value, callback_id]() {
      auto encode_params =
          voltron::StandardMessageCodec::GetInstance().EncodeMessage(voltron::EncodableValue(value));
      global_callback_func(callback_id,
                           encode_params->data(),
                           footstone::checked_numeric_cast<size_t, int32_t>(encode_params->size()));
    };
    const Work *work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
    return true;
  } else {
    FOOTSTONE_DLOG(ERROR) << "call callback error, func not found";
  }
  return false;
}

bool CallGlobalCallbackWithValue(int32_t callback_id, const voltron::EncodableValue& value) {
  if (global_callback_func) {
    const Work work = [value, callback_id]() {
      auto encode_params =
          voltron::StandardMessageCodec::GetInstance().EncodeMessage(value);
      global_callback_func(callback_id,
                           encode_params->data(),
                           footstone::checked_numeric_cast<size_t, int32_t>(encode_params->size()));
    };
    const Work *work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
    return true;
  } else {
    FOOTSTONE_DLOG(ERROR) << "call callback error, func not found";
  }
  return false;
}

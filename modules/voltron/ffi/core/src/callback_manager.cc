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

#include "footstone/logging.h"
#include "footstone/check.h"
#include "data_holder.h"
#include "port_holder.h"

uint32_t VoltronRegisterDartPostCObject(dart_post_c_object_type dart_post_c_object, int64_t port) {
  return voltron::DartPortHolder::CreateDartPortHolder(dart_post_c_object, port);
}

EXTERN_C void VoltronExecuteCallback(Work *work_ptr) {
  const Work work = *work_ptr;
  work();
  delete work_ptr;
}

EXTERN_C uint32_t InitFfi(dart_post_c_object_type dart_post_c_object, int64_t port) {
  return VoltronRegisterDartPostCObject(dart_post_c_object, port);
}

EXTERN_C int32_t AddCallFunc(uint32_t ffi_id, const char16_t *register_header, int32_t type, void *func) {
  auto port_holder = std::any_cast<std::shared_ptr<voltron::DartPortHolder>>(voltron::FindObject(ffi_id));
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "call callback error, port holder not found, ensure ffi module init";
    return false;
  }

  return port_holder->AddCallFunc(register_header, type, func);
}

bool PostWorkToDart(uint32_t ffi_id, const Work *work) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "post work error, port holder not found, ensure ffi module init";
    return false;
  }

  return port_holder->PostWorkToDart(work);
}

bool CallGlobalCallback(uint32_t ffi_id, int32_t callback_id, int64_t value) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR) << "call callback error, port holder not found, ensure ffi module init";
    return false;
  }

  auto global_callback_func = port_holder->GetGlobalCallbackFunc();
  if (!global_callback_func) {
    FOOTSTONE_DLOG(ERROR) << "call callback error, func not found";
    return false;
  }

  const Work work = [value, callback_id, global_callback_func]() {
    auto encode_params =
        voltron::StandardMessageCodec::GetInstance().EncodeMessage(voltron::EncodableValue(value));
    global_callback_func(callback_id,
                         encode_params->data(),
                         footstone::checked_numeric_cast<size_t, int32_t>(encode_params->size()));
  };
  const Work *work_ptr = new Work(work);
  return port_holder->PostWorkToDart(work_ptr);
}

bool CallGlobalCallbackWithValue(uint32_t ffi_id,
                                 int32_t callback_id,
                                 const voltron::EncodableValue &value) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR)
    << "call callback with value  error, port holder not found, ensure ffi module init";
    return false;
  }

  auto global_callback_func = port_holder->GetGlobalCallbackFunc();
  if (!global_callback_func) {
    FOOTSTONE_DLOG(ERROR) << "call callback error, func not found";
    return false;
  }

  const Work work = [value, callback_id, global_callback_func]() {
    auto encode_params =
        voltron::StandardMessageCodec::GetInstance().EncodeMessage(value);
    global_callback_func(callback_id,
                         encode_params->data(),
                         footstone::checked_numeric_cast<size_t, int32_t>(encode_params->size()));
  };
  const Work *work_ptr = new Work(work);
  return port_holder->PostWorkToDart(work_ptr);
}

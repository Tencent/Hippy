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

#pragma once

#include "common_header.h"
#include "standard_message_codec.h"
#include "dart_port.h"

enum class DefaultRegisterFuncType {
  kGlobalCallback
};

#ifdef __cplusplus
extern "C" {
#endif
uint32_t VoltronRegisterDartPostCObject(dart_post_c_object_type dart_post_c_object, int64_t port);

bool PostWorkToDart(uint32_t ffi_id, const Work *work);

bool CallGlobalCallback(uint32_t ffi_id, int32_t callback_id, int64_t value);

bool CallGlobalCallbackWithValue(uint32_t ffi_id, int32_t callback_id, const voltron::EncodableValue& value);

EXTERN_C void VoltronExecuteCallback(Work *work_ptr);

EXTERN_C uint32_t InitFfi(dart_post_c_object_type dart_post_c_object, int64_t port);

EXTERN_C int32_t AddCallFunc(uint32_t ffi_id, const char16_t *register_header, int32_t type, void *func);
#ifdef __cplusplus
}
#endif

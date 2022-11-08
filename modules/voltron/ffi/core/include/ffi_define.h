/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include <cstdint>

#include "common_header.h"
#include "callback_manager.h"

enum class DefaultRegisterFuncType {
  kGlobalCallback
};

typedef void (*global_callback)(int32_t callback_id, const uint8_t* params, int32_t params_len);
typedef int32_t (*register_call_func_ex)(int32_t type, void *func);

extern global_callback global_callback_func;

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int32_t InitFfi(dart_post_c_object_type dart_post_c_object, int64_t port);

EXTERN_C int32_t AddCallFunc(const char16_t *register_header, int32_t type, void *func);

EXTERN_C int32_t AddCallFuncRegister(const char16_t *register_header, register_call_func_ex func);

#ifdef __cplusplus
}
#endif


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

#include <cstdint>

#include "render/ffi/common_header.h"
#include "core/core.h"

enum FFIRegisterFuncType {
  kCallNative = 3,
  kReportJsonException,
  kReportJsException,
  kSendResponse,
  kSendNotification,
  kDestroy
};

// hippy call native方法
typedef void (*call_native)(int32_t engine_id, const char16_t* module_name, const char16_t* module_func,
                            const char16_t* call_id, const void* params_data, uint32_t params_len,
                            int32_t bridge_param_json);
typedef void (*report_json_exception)(int32_t engine_id, const char* json_value);
typedef void (*report_js_exception)(int32_t engine_id, const char16_t* description_stream,
                                    const char16_t* stack_stream);
typedef void (*send_response)(int32_t engine_id, const uint16_t* source, int32_t len);
typedef void (*send_notification)(int32_t engine_id, const uint16_t* source, int32_t len);
// 销毁
typedef void (*destroy_function)(int32_t engine_id);

extern call_native call_native_func;
extern report_json_exception report_json_exception_func;
extern report_js_exception report_js_exception_func;
extern send_response send_response_func;
extern send_notification send_notification_func;
extern destroy_function destroy_func;

int32_t RegisterCallFuncEx(int32_t type, void *func);

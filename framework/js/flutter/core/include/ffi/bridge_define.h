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

#define CALL_NATIVE_FUNC_TYPE 0
#define REPORT_JSON_EXCEPTION_FUNC_TYPE 1
#define REPORT_JS_EXCEPTION_FUNC_TYPE 2
#define SEND_RESPONSE_FUNC_TYPE 3
#define SEND_NOTIFICATION_FUNC_TYPE 4
#define DESTROY_FUNC_TYPE 5
#define GLOBAL_CALLBACK_TYPE 6
#define POST_RENDER_OP_TYPE 7
#define CALCULATE_NODE_LAYOUT_TYPE 8

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
typedef void (*global_callback)(int32_t callback_id, int64_t value);
typedef void (*post_render_op)(int32_t engine_id, int32_t root_id, const void* data, int64_t length);
typedef int64_t* (*calculate_node_layout)(int32_t engine_id, int32_t root_id, int32_t node_id, double width,
                                          int32_t width_mode, double height, int32_t height_mode);

extern call_native call_native_func;
extern report_json_exception report_json_exception_func;
extern report_js_exception report_js_exception_func;
extern send_response send_response_func;
extern send_notification send_notification_func;
extern destroy_function destroy_func;
extern global_callback global_callback_func;
extern post_render_op post_render_op_func;
extern calculate_node_layout calculate_node_layout_func;

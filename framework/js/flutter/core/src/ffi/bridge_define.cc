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

#include "ffi/bridge_define.h"

call_native call_native_func = nullptr;
report_json_exception report_json_exception_func = nullptr;
report_js_exception report_js_exception_func = nullptr;
send_response send_response_func = nullptr;
send_notification send_notification_func = nullptr;
destroy_function destroy_func = nullptr;
global_callback global_callback_func = nullptr;
post_render_op post_render_op_func = nullptr;
calculate_node_layout calculate_node_layout_func = nullptr;

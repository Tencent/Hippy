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

int32_t RegisterCallFuncEx(int32_t type, void *func) {
  FOOTSTONE_DLOG(INFO) << "start register func, type " << type;
  if (type == FFIRegisterFuncType::kCallNative) {
    call_native_func = reinterpret_cast<call_native>(func);
    return true;
  } else if (type == FFIRegisterFuncType::kReportJsonException) {
    report_json_exception_func = reinterpret_cast<report_json_exception>(func);
    return true;
  } else if (type == FFIRegisterFuncType::kReportJsException) {
    report_js_exception_func = reinterpret_cast<report_js_exception>(func);
    return true;
  } else if (type == FFIRegisterFuncType::kSendResponse) {
    send_response_func = reinterpret_cast<send_response>(func);
    return true;
  } else if (type == FFIRegisterFuncType::kSendNotification) {
    send_notification_func = reinterpret_cast<send_notification>(func);
    return true;
  } else if (type == FFIRegisterFuncType::kDestroy) {
    destroy_func = reinterpret_cast<destroy_function>(func);
    return true;
  }
  FOOTSTONE_DLOG(ERROR) << "register func error, unknown type " << type;
  return false;
}

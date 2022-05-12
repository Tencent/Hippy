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
#include <mutex>
#include <cassert>

#include "render/ffi/callback_manager.h"
#include "ffi/ffi_bridge_runtime.h"

namespace voltron {
void FFIJSBridgeRuntime::CallDart(std::u16string &moduleName, std::u16string &moduleFunc, std::u16string &callId,
                                  void* paramsData, uint32_t paramsLen, bool bridgeParamJson,
                                   std::function<void()> callback) {
  assert(call_native_func != nullptr);
  const Work work = [engine_id = engine_id_, moduleName_ = std::move(moduleName), moduleFunc_ = std::move(moduleFunc), callId_ = std::move(callId), paramsData, paramsLen, bridgeParamJson,
      callback_ = std::move(callback)]() {
    call_native_func(engine_id, moduleName_.c_str(), moduleFunc_.c_str(), callId_.c_str(), paramsData, paramsLen, bridgeParamJson);
    free(paramsData);
    if (callback_) {
      callback_();
    }
  };
  const Work* work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
}

void FFIJSBridgeRuntime::ReportJSONException(const char* jsonValue) {
  assert(report_json_exception_func != nullptr);
  const Work work = [engine_id = engine_id_, jsonValue]() { report_json_exception_func(engine_id, jsonValue); };
  const Work* work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
}

void FFIJSBridgeRuntime::ReportJSException(std::u16string &description_stream, std::u16string &stack_stream) {
  assert(report_js_exception_func != nullptr);
  const Work work = [engine_id = engine_id_, description_stream_ = std::move(description_stream), stack_stream_ = std::move(stack_stream)]() {
    report_js_exception_func(engine_id, description_stream_.c_str(), stack_stream_.c_str());
  };
  const Work* work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
}

void FFIJSBridgeRuntime::SendResponse(const uint16_t* source, int len) {
  void* copy = (void*)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void*)source, len * sizeof(uint16_t));
  assert(send_response_func != nullptr);
  const Work work = [engine_id = engine_id_, data = (uint16_t*)copy, len]() {
    send_response_func(engine_id, data, len);
    free(data);
  };
  const Work* work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
}

void FFIJSBridgeRuntime::SendNotification(const uint16_t* source, int len) {
  void* copy = (void*)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void*)source, len * sizeof(uint16_t));
  assert(send_notification_func != nullptr);
  const Work work = [engine_id = engine_id_, data = (uint16_t*)copy, len]() {
    send_notification_func(engine_id, data, len);
    free(data);
  };
  const Work* work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
}

void FFIJSBridgeRuntime::Destroy() {
  if (destroy_func) {
    const Work work = [engine_id = engine_id_]() { destroy_func(engine_id); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

FFIJSBridgeRuntime::FFIJSBridgeRuntime(int32_t engine_id) : engine_id_(engine_id), JSBridgeRuntime(engine_id) {}

void FFIJSBridgeRuntime::SetRuntimeId(int64_t runtime_id) { runtime_id_ = runtime_id; }

int64_t FFIJSBridgeRuntime::GetRuntimeId() { return runtime_id_; }

}  // namespace voltron

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

#include "callback_manager.h"
#include "bridge/ffi_bridge_runtime.h"

namespace voltron {
JSBridgeRuntime::JSBridgeRuntime(int32_t engine_id, uint32_t ffi_id): BridgeRuntime(engine_id, ffi_id) {}

void FFIJSBridgeRuntime::CallDart(std::u16string &moduleName, std::u16string &moduleFunc, std::u16string &callId,
                                  std::string params, bool bridgeParamJson,
                                  std::function<void()> callback) {
  auto call_native_func = GetCallNativeFunc(ffi_id_);
  assert(call_native_func != nullptr);
  const Work work = [call_native_func, engine_id = engine_id_, moduleName_ = std::move(moduleName),
                     moduleFunc_ = std::move(moduleFunc), callId_ = std::move(callId),
                     params = std::move(params), bridgeParamJson,
      callback_ = std::move(callback)]() {
    call_native_func(engine_id, moduleName_.c_str(), moduleFunc_.c_str(),
                     callId_.c_str(), params.data(), static_cast<uint32_t>(params.length()), bridgeParamJson);
    if (callback_) {
      callback_();
    }
  };
  const Work* work_ptr = new Work(work);
  PostWork(work_ptr);
}

void FFIJSBridgeRuntime::ReportJSONException(const char* jsonValue) {
  auto report_json_exception_func = GetReportJsonExceptionFunc(ffi_id_);
  assert(report_json_exception_func != nullptr);
  const Work work = [report_json_exception_func,
      engine_id = engine_id_, jsonValue]() { report_json_exception_func(engine_id, jsonValue); };
  const Work *work_ptr = new Work(work);
  PostWork(work_ptr);
}

void FFIJSBridgeRuntime::ReportJSException(std::u16string &description_stream, std::u16string &stack_stream) {
  auto report_js_exception_func = GetReportJsExceptionFunc(ffi_id_);
  assert(report_js_exception_func != nullptr);
  const Work work = [report_js_exception_func, engine_id = engine_id_,
      description_stream_ = std::move(description_stream),
      stack_stream_ = std::move(stack_stream)]() {
    report_js_exception_func(engine_id, description_stream_.c_str(), stack_stream_.c_str());
  };
  const Work *work_ptr = new Work(work);
  PostWork(work_ptr);
}

FFIJSBridgeRuntime::FFIJSBridgeRuntime(int32_t engine_id, uint32_t ffi_id) : JSBridgeRuntime(engine_id, ffi_id), engine_id_(engine_id), ffi_id_(ffi_id) {}

void FFIJSBridgeRuntime::SetRuntimeId(int64_t runtime_id) { runtime_id_ = runtime_id; }

int64_t FFIJSBridgeRuntime::GetRuntimeId() { return runtime_id_; }

uint32_t FFIJSBridgeRuntime::GetFfiId() { return ffi_id_; }

void FFIJSBridgeRuntime::PostWork(const Work* work) {
  PostWorkToDart(ffi_id_, work);
}
}  // namespace voltron

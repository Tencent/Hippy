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

#include <functional>
#include <memory>

#include "base/unicode_string_view.h"
#include "runtime.h"
#include "core/base/common.h"
#include "core/runtime/v8/bridge.h"
#include "v8/v8.h"

namespace hippy::runtime {

enum class CALL_FUNCTION_CB_STATE {
  NO_METHOD_ERROR = -2,
  DESERIALIZER_FAILED = -1,
  SUCCESS = 0,
};

class V8BridgeUtils {
 public:
  using bytes = std::string;
  using unicode_string_view = tdf::base::unicode_string_view;
  using u8string = unicode_string_view::u8string;
  using V8VMInitParam = hippy::napi::V8VMInitParam;
  using RegisterFunction = hippy::base::RegisterFunction;
  using Bridge = hippy::Bridge;

  using ReportJsException = std::function<void(const std::shared_ptr<Runtime>& runtime,
                                               const unicode_string_view& desc,
                                               const unicode_string_view& stack)>;

  static int64_t InitInstance(bool enable_v8_serialization,
                              bool is_dev_module,
                              const unicode_string_view& global_config,
                              int64_t group,
                              const std::shared_ptr<V8VMInitParam>& param,
                              std::shared_ptr<Bridge> bridge,
                              const RegisterFunction& scope_cb,
                              const RegisterFunction& call_native_cb,
                              const unicode_string_view& data_dir,
                              const unicode_string_view& ws_url);
  static bool DestroyInstance(int64_t runtime_id,  const std::function<void()>& callback, bool is_reload);
  static bool RunScript(const std::shared_ptr<Runtime>& runtime,
                        const unicode_string_view& file_name,
                        bool is_use_code_cache,
                        const unicode_string_view& code_cache_dir,
                        const unicode_string_view& uri,
                        bool is_local_file);
  static bool RunScriptWithoutLoader(const std::shared_ptr<Runtime>& runtime,
                                     const unicode_string_view& file_name,
                                     bool is_use_code_cache,
                                     const unicode_string_view& code_cache_dir,
                                     const unicode_string_view& uri,
                                     bool is_local_file,
                                     std::function<unicode_string_view()> content_cb);
  static void HandleUncaughtJsError(v8::Local<v8::Message> message, v8::Local<v8::Value> error);
  static inline void SetOnThrowExceptionToJS(std::function<void(std::shared_ptr<Runtime>,
                                                                unicode_string_view,
                                                                unicode_string_view)> on_throw_exception_to_js) {
    on_throw_exception_to_js_ = on_throw_exception_to_js;
  }
  static void CallJs(const unicode_string_view& action,
                     int32_t runtime_id,
                     std::function<void(CALL_FUNCTION_CB_STATE, unicode_string_view)> cb,
                     bytes buffer_data,
                     std::function<void()> on_js_runner);
  static void CallNative(hippy::napi::CBDataTuple* data,
                         const std::function<void(std::shared_ptr<Runtime>,
                                                  unicode_string_view,
                                                  unicode_string_view,
                                                  unicode_string_view,
                                                  bool,
                                                  bytes)>& cb);
  static void LoadInstance(int32_t runtime_id, bytes&& buffer_data);
  static void UnloadInstance(int32_t runtime_id,
                              std::function<void(CALL_FUNCTION_CB_STATE, unicode_string_view)> cb);
 private:
  static std::function<void(std::shared_ptr<Runtime>,
                            unicode_string_view,
                            unicode_string_view)> on_throw_exception_to_js_;
};

}


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

#include "driver/scope.h"
#include "footstone/string_view.h"

namespace hippy {
inline namespace driver {

enum class CALL_FUNCTION_CB_STATE {
  NO_METHOD_ERROR = -2,
  DESERIALIZER_FAILED = -1,
  SUCCESS = 0,
};

class JsDriverUtils {
 public:
  using byte_string = std::string;
  using string_view = footstone::stringview::string_view;
  using TaskRunner = footstone::TaskRunner;
  using VMInitParam = hippy::VM::VMInitParam;

  static std::shared_ptr<Engine> CreateEngineAndAsyncInitialize(const std::shared_ptr<TaskRunner>& task_runner,
                                                                const std::shared_ptr<VMInitParam>& param,
                                                                int64_t group_id,
                                                                bool is_reload);

  static void InitInstance(const std::shared_ptr<Engine>& engine,
                           const std::shared_ptr<VMInitParam>& param,
                           const string_view& global_config,
                           std::function<void(std::shared_ptr<Scope>)>&& scope_initialized_callback,
                           const JsCallback& call_host_callback);
  static void DestroyInstance(std::shared_ptr<Engine>&& engine,
                              std::shared_ptr<Scope>&& scope,
                              const std::function<void(bool)>& callback,
                              bool is_reload);
  static bool RunScript(const std::shared_ptr<Scope>& scope,
                        const string_view& file_name,
                        bool is_use_code_cache,
                        const string_view& code_cache_dir,
                        const string_view& uri,
                        bool is_local_file);
  static void CallJs(const string_view& action,
                     const std::shared_ptr<Scope>& scope,
                     std::function<void(CALL_FUNCTION_CB_STATE, string_view)> cb,
                     byte_string buffer_data,
                     std::function<void()> on_js_runner
    );

  static void CallNative(hippy::napi::CallbackInfo& info,
                         const std::function<void(std::shared_ptr<Scope>,
                                                  string_view,
                                                  string_view,
                                                  string_view,
                                                  bool,
                                                  byte_string)>& callback);
  static void LoadInstance(const std::shared_ptr<Scope>& scope, byte_string&& buffer_data);
  static void UnloadInstance(const std::shared_ptr<Scope>& scope, byte_string&& buffer_data);
};

} // namespace driver
} // namespace hippy

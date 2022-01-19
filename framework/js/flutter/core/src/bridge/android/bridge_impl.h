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

#include "runtime.h"

#ifdef __cplusplus
extern "C" {
#endif
using unicode_string_view = tdf::base::unicode_string_view;
using hippy::DomManager;
using voltron::PlatformRuntime;
class BridgeImpl {
 public:
  BridgeImpl() = default;
  ~BridgeImpl() = default;

 public:
  static int64_t InitJsFrameWork(const std::shared_ptr<PlatformRuntime>& platform_runtime, bool single_thread_mode,
                                 bool bridge_param_json, bool is_dev_module, int64_t group_id,
                                 const char16_t* char_globalConfig, const std::function<void(int64_t)>& callback);

  static bool RunScriptFromFile(int64_t runtime_id, const char16_t* script_path_str, const char16_t* script_name_str,
                                const char16_t* code_cache_dir_str, bool can_use_code_cache,
                                std::function<void(int64_t)> callback);

  static bool RunScriptFromAssets(int64_t runtime_id, bool can_use_code_cache, const char16_t* asset_name_str,
                                  const char16_t* code_cache_dir_str, std::function<void(int64_t)> callback,
                                  const char16_t* asset_content_str);

  static void RunNativeRunnable(int64_t runtime_id, const char16_t* code_cache_path, int64_t runnable_id,
                                std::function<void(int64_t)> callback);

  static void Destroy(int64_t runtime_id, bool single_thread_mode, std::function<void(int64_t)> callback);

  static void CallFunction(int64_t runtime_id, const char16_t* action, const char16_t* params,
                           std::function<void(int64_t)> callback);

  static void BindDomManager(int64_t runtime_id, const std::shared_ptr<DomManager>& dom_manager);

 private:
  static bool RunScript(int64_t runtime_id, const unicode_string_view& script_content,
                        const unicode_string_view& script_name, const unicode_string_view& script_path,
                        bool can_use_code_cache, const unicode_string_view& code_cache_dir, bool fromAssets);
};

#ifdef __cplusplus
}
#endif

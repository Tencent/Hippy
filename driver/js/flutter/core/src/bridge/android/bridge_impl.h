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

#include "bridge/bridge_runtime.h"

#ifdef __cplusplus
extern "C" {
#endif
using unicode_string_view = tdf::base::unicode_string_view;
using hippy::DomManager;
using voltron::JSBridgeRuntime;

class BridgeImpl {
 public:
  BridgeImpl() = default;
  ~BridgeImpl() = default;

 public:
  static int64_t InitJsEngine(const std::shared_ptr<JSBridgeRuntime> &platform_runtime,
                              bool single_thread_mode,
                              bool bridge_param_json,
                              bool is_dev_module,
                              int64_t group_id,
                              const char16_t *char_globalConfig,
                              size_t initial_heap_size,
                              size_t maximum_heap_size,
                              const std::function<void(int64_t)> &callback);

  static bool RunScriptFromFile(int64_t runtime_id, const char16_t* script_path_str, const char16_t* script_name_str,
                                const char16_t* code_cache_dir_str, bool can_use_code_cache,
                                std::function<void(int64_t)> callback);

  static bool RunScriptFromAssets(int64_t runtime_id, bool can_use_code_cache, const char16_t* asset_name_str,
                                  const char16_t* code_cache_dir_str, std::function<void(int64_t)> callback,
                                  const char16_t* asset_content_str);

  static void Destroy(int64_t runtime_id, const std::function<void(int64_t)>& callback);

  static void CallFunction(int64_t runtime_id, const char16_t* action, std::string params,
                           std::function<void(int64_t)> callback);

  static void LoadInstance(int64_t runtime_id, std::string&& params);

  static void UnloadInstance(int64_t runtime_id, std::function<void(int64_t)> callback);

  static void BindDomManager(int64_t runtime_id, const std::shared_ptr<DomManager>& dom_manager);
};

#ifdef __cplusplus
}
#endif

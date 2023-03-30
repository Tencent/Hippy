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

#include "encodable_value.h"
#include "callback_manager.h"
#include "common_header.h"
#include "footstone/persistent_object_map.h"
#include "render/bridge/bridge_define.h"
#include "render/queue/voltron_render_manager.h"
#include "footstone/worker_manager.h"

namespace voltron {
using hippy::DomManager;
using NativeCallback = std::function<void(const EncodableValue &)>;

class BridgeRuntime {
public:

  virtual ~BridgeRuntime() = default;
  explicit BridgeRuntime(int32_t engine_id);

  EXPORT int64_t CalculateNodeLayout(int32_t instance_id, int32_t node_id,
                                     double width, int32_t width_mode,
                                     double height, int32_t height_mode);

protected:
  int32_t engine_id_ = 0;
  std::mutex mutex_;
};

class BridgeManager {
public:
  static Sp<BridgeManager> Create(int32_t engine_id, const Sp<BridgeRuntime>& runtime);
  static Sp<BridgeManager> Find(int32_t engine_id);
  static void Destroy(int32_t engine_id);

  static Sp<VoltronRenderManager> CreateRenderManager();
  static void DestroyRenderManager(uint32_t render_manager_id);
  static Sp<VoltronRenderManager> FindRenderManager(uint32_t render_manager_id);

  std::shared_ptr<BridgeRuntime> GetRuntime();
  void BindRuntime(const Sp<BridgeRuntime> &runtime);

  String AddNativeCallback(const String &tag, const NativeCallback &callback);
  void RemoveNativeCallback(const String &callback_id);
  void CallNativeCallback(const String &callback_id,
                          std::unique_ptr<EncodableValue> params, bool keep);

  ~BridgeManager();
  explicit BridgeManager();

private:
  std::weak_ptr<BridgeRuntime> runtime_;
  footstone::PersistentObjectMap<String, NativeCallback> native_callback_map_;

  int callback_id_increment_ = 0;
};
} // namespace voltron

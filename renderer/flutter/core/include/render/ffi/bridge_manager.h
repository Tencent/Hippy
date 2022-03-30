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
#include "render/ffi/bridge_define.h"
#include "render/ffi/callback_manager.h"
#include "render/ffi/common_header.h"

namespace voltron {

using hippy::DomManager;
// using VisitRenderCallback = std::function<void(const
// std::weak_ptr<VoltronRenderManager>&)>;
using NativeCallback = std::function<void(const EncodableValue &)>;

class BridgeRuntime {
public:
  virtual ~BridgeRuntime() = default;
  explicit BridgeRuntime(int32_t engine_id) : engine_id_(engine_id) {};

  EXPORT int64_t CalculateNodeLayout(int32_t instance_id, int32_t node_id,
                                     double width, int32_t width_mode,
                                     double height, int32_t height_mode);

protected:
  int32_t engine_id_ = 0;
};

class BridgeManager {
public:
  static Sp<BridgeManager> Create(int32_t engine_id, Sp<BridgeRuntime> runtime);
  static Sp<BridgeManager> Find(int32_t engine_id);
  static void Destroy(int32_t engine_id);
  static void
  ReverseTraversal(int32_t engine_id,
                   const std::function<void(Sp<hippy::RenderManager>)> &call);

  void InitInstance(int32_t engine_id, int32_t root_id,
                    Sp<hippy::RenderManager> render_manager);
  void DestroyInstance(int32_t engine_id, int32_t root_id);
  std::weak_ptr<BridgeRuntime> GetRuntime();
  std::shared_ptr<hippy::RenderManager> GetRenderManager(int32_t root_id);
  Sp<DomManager> GetDomManager(int32_t root_id);

  String AddNativeCallback(const String &tag, const NativeCallback &callback);
  void RemoveNativeCallback(const String &callback_id);
  void CallNativeCallback(const String &callback_id,
                          std::unique_ptr<EncodableValue> params, bool keep);

  ~BridgeManager();
  explicit BridgeManager(int32_t engine_id);

private:
  void BindRuntime(const Sp<BridgeRuntime> &runtime);
  void BindRenderManager(int32_t root_id,
                         const Sp<hippy::RenderManager> &render_manager);
  void BindDomManager(int32_t root_id, const Sp<DomManager> &dom_manager);

  std::weak_ptr<BridgeRuntime> runtime_;
  std::map<int, Sp<hippy::RenderManager>> render_manager_map_;
  Map<int, Sp<DomManager>> dom_manager_map_;
  Map<String, NativeCallback> native_callback_map_;

  int32_t engine_id_;
  int callback_id_increment_ = 0;
};
} // namespace voltron

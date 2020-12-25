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

#ifndef HIPYY_JNI_RUNTIME_H_
#define HIPYY_JNI_RUNTIME_H_

#include <jni.h>
#include <stdint.h>

#include <memory>

#include "core/core.h"
#include "inspector/v8_inspector_client_impl.h"
#include "jni/scoped_java_ref.h"

class Runtime {
 public:
  Runtime(std::shared_ptr<JavaRef> bridge, bool is_json, bool is_dev);

  inline bool IsParamJson() { return is_json_; }
  inline bool IsDebug() { return is_debug_; }
  inline int64_t GetId() { return id_; };
  inline int64_t GetGroupId() { return group_id_; }
  inline std::shared_ptr<JavaRef> GetBridge() { return bridge_; }
  inline std::shared_ptr<Engine> GetEngine() { return engine_; }
  inline std::shared_ptr<Scope> GetScope() { return scope_; }
  inline std::shared_ptr<hippy::napi::CtxValue> GetBridgeFunc() {
    return bridge_func_;
  }

  inline void SetGroupId(int64_t id) { group_id_ = id; }
  inline void SetBridgeFunc(std::shared_ptr<hippy::napi::CtxValue> func) {
    bridge_func_ = func;
  }
  inline void SetEngine(std::shared_ptr<Engine> engine) { engine_ = engine; }
  inline void SetScope(std::shared_ptr<Scope> scope) { scope_ = scope; }

  static void Insert(std::shared_ptr<Runtime> runtime);
  static std::shared_ptr<Runtime> Find(int64_t id);
  static bool Erase(int64_t id);
  static bool Erase(std::shared_ptr<Runtime> runtime);
  static std::shared_ptr<int64_t> GetKey(std::shared_ptr<Runtime> runtime);
  static bool ReleaseKey(int64_t id);

 private:
  bool is_json_;
  bool is_debug_;
  int64_t group_id_;
  std::shared_ptr<JavaRef> bridge_;
  std::shared_ptr<Engine> engine_;
  std::shared_ptr<Scope> scope_;
  std::shared_ptr<hippy::napi::CtxValue> bridge_func_;
  int64_t id_;
};

#endif  // HIPYY_JNI_RUNTIME_H_

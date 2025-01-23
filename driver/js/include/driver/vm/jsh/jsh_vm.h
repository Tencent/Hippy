/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "driver/vm/js_vm.h"
#include "driver/napi/js_ctx.h"
#include "footstone/string_view.h"
#include <ark_runtime/jsvm.h>

#if defined(ENABLE_INSPECTOR) && !defined(JSH_WITHOUT_INSPECTOR)
#include "driver/vm/jsh/inspector/jsh_inspector_client_impl.h"
#endif

namespace hippy {
inline namespace driver {
inline namespace vm {

struct JSHVMInitParam : public VM::VMInitParam {
  enum class JSHVMInitType {
    kNoSnapshot, kCreateSnapshot, kUseSnapshot
  };

  size_t initial_heap_size_in_bytes;
  size_t maximum_heap_size_in_bytes;
  JSHVMInitType type;
  bool enable_v8_serialization;
};

class JSHVM : public VM {
 public:
  using string_view = footstone::string_view;
#if defined(ENABLE_INSPECTOR) && defined(JS_JSH) && !defined(JSH_WITHOUT_INSPECTOR)
  using JSHInspectorClientImpl = hippy::inspector::JSHInspectorClientImpl;
#endif
  struct DeserializerResult {
    bool flag;
    std::shared_ptr<CtxValue> result;
    string_view message;
  };

  JSHVM(const std::shared_ptr<JSHVMInitParam>& param);
  ~JSHVM();

  inline void SaveUncaughtExceptionCallback(std::unique_ptr<FunctionWrapper>&& wrapper) {
    uncaught_exception_ = std::move(wrapper);
  }
  inline bool IsEnableV8Serialization() { return enable_v8_serialization_; }
  inline std::string& GetBuffer() { return serializer_reused_buffer_; }

#if defined(ENABLE_INSPECTOR) && defined(JS_JSH) && !defined(JSH_WITHOUT_INSPECTOR)
  inline void SetInspectorClient(std::shared_ptr<JSHInspectorClientImpl> inspector_client) {
    inspector_client_ = inspector_client;
  }
  inline std::shared_ptr<JSHInspectorClientImpl> GetInspectorClient() {
    return inspector_client_;
  }
#endif
  virtual std::shared_ptr<Ctx> CreateContext() override;
  virtual std::shared_ptr<CtxValue> ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) override;
  void AddUncaughtExceptionMessageListener(const std::unique_ptr<FunctionWrapper>& wrapper) const;
  DeserializerResult Deserializer(const std::shared_ptr<Ctx>& ctx, const std::string& buffer);

  static std::shared_ptr<CtxValue> CreateJSHString(JSVM_Env env, const string_view& str_view);
  static string_view ToStringView(JSVM_Env env, JSVM_Value string_value);

  static void PlatformDestroy();
  
  JSVM_VM vm_ = nullptr;
  JSVM_VMScope vm_scope_ = nullptr;
  std::unique_ptr<FunctionWrapper> uncaught_exception_;
  std::string serializer_reused_buffer_;
  bool enable_v8_serialization_ = false;

#if defined(ENABLE_INSPECTOR) && !defined(JSH_WITHOUT_INSPECTOR)
  std::shared_ptr<JSHInspectorClientImpl> inspector_client_;
#endif
};

}
}
}

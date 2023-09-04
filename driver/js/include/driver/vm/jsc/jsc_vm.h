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
#include <set>
#include <JavaScriptCore/JavaScriptCore.h>

#include "footstone/string_view.h"
#include "driver/napi/js_ctx.h"

namespace hippy {
inline namespace driver {

inline namespace napi {
class ConstructorData;
}

inline namespace vm {

class JSCVM : public VM, public std::enable_shared_from_this<JSCVM> {
public:
  JSCVM(): VM() { vm_ = JSContextGroupCreate(); }
  
  ~JSCVM() {
    JSContextGroupRelease(vm_);
  }
  
  std::unordered_map<void*, std::unordered_map<JSClassRef, std::unique_ptr<ConstructorData>>> constructor_data_holder_;
  JSContextGroupRef vm_;
  
  static void SaveConstructorDataPtr(void* ptr);
  static void ClearConstructorDataPtr(void* ptr);
  static bool IsValidConstructorDataPtr(void* ptr);
  
  static std::set<void*> constructor_data_ptr_set_;
  static std::mutex mutex_;
    
  virtual std::shared_ptr<CtxValue> ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) override;
  virtual std::shared_ptr<Ctx> CreateContext() override;
  
  static JSStringRef CreateJSCString(const footstone::string_view& str_view);
};

}
}
}

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

#include <memory>

#include "driver/napi/js_ctx.h"
#include "driver/vm/js_vm.h"
#include "footstone/hippy_value.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace driver {
inline namespace vm {

using HippyValue = footstone::value::HippyValue;

struct HermesVMInitParam : public VM::VMInitParam {
};

class HermesVM : public VM {
 public:
  HermesVM(const std::shared_ptr<HermesVMInitParam>& param);
  ~HermesVM() = default;

  virtual std::shared_ptr<CtxValue> ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) override;
  virtual std::shared_ptr<Ctx> CreateContext() override;
  bool ParseHippyValue(const std::shared_ptr<Ctx>& ctx, const string_view& json, HippyValue& hippy_value);
  static std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param);
};

}  // namespace vm
}  // namespace driver
}  // namespace hippy

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
#include "footstone/logging.h"

namespace hippy {
inline namespace driver {
inline namespace vm {

struct VMInitParam {};

class VM {
 public:
  using string_view = footstone::string_view;
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;

  VM(std::shared_ptr<VMInitParam> param = nullptr) {}
  virtual ~VM() { FOOTSTONE_DLOG(INFO) << "~VM"; }

  static void HandleUncaughtException(const std::shared_ptr<Ctx>& ctx, const std::shared_ptr<CtxValue>& exception);
  virtual std::shared_ptr<CtxValue> ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) = 0;
  virtual std::shared_ptr<Ctx> CreateContext() = 0;
};

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param);

}
}
}

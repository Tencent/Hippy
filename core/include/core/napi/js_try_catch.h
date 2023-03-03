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

#include "base/unicode_string_view.h"

namespace hippy {
namespace napi {

class Ctx;
class CtxValue;

class TryCatch {
 public:
  explicit TryCatch(bool enable = false, std::shared_ptr<Ctx> ctx = nullptr)
      : enable_(enable), ctx_(ctx) {}
  virtual ~TryCatch() {}
  virtual void ReThrow() = 0;
  virtual bool HasCaught() = 0;
  virtual bool CanContinue() = 0;
  virtual bool HasTerminated() = 0;
  virtual bool IsVerbose() = 0;
  virtual void SetVerbose(bool verbose) = 0;
  virtual std::shared_ptr<CtxValue> Exception() = 0;
  virtual tdf::base::unicode_string_view GetExceptionMsg() = 0;

 protected:
  bool enable_;
  std::shared_ptr<Ctx> ctx_;
};

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable, std::shared_ptr<Ctx> ctx);

}
}

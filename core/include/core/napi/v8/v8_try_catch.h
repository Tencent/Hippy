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

#include "core/napi/js_try_catch.h"

#include "base/unicode_string_view.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
namespace napi {

class V8TryCatch : public TryCatch {
 public:
  explicit V8TryCatch(bool enable = false, const std::shared_ptr<Ctx>& ctx = nullptr);
  virtual ~V8TryCatch();

  virtual void ReThrow();
  virtual bool HasCaught();
  virtual bool CanContinue();
  virtual bool HasTerminated();
  virtual bool IsVerbose();
  virtual void SetVerbose(bool verbose);
  virtual std::shared_ptr<CtxValue> Exception();
  virtual tdf::base::unicode_string_view GetExceptionMsg();

 private:
  std::shared_ptr<v8::TryCatch> try_catch_;
};

}
}

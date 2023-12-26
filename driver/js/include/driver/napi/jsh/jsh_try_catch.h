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

#include "driver/napi/js_try_catch.h"
#include "driver/napi/jsh/jsh_ctx_value.h"
#include "footstone/string_view.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

class JSHTryCatch : public TryCatch {
 public:
  explicit JSHTryCatch(bool enable = false, const std::shared_ptr<Ctx>& ctx = nullptr);
  virtual ~JSHTryCatch();

  virtual void ReThrow();
  virtual bool HasCaught();
  virtual bool CanContinue();
  virtual bool HasTerminated();
  virtual bool IsVerbose();
  virtual void SetVerbose(bool verbose);
  virtual std::shared_ptr<CtxValue> Exception();
  virtual footstone::string_view GetExceptionMessage();

 private:
  std::shared_ptr<JSHCtxValue> exception_;
  bool is_verbose_ = false;
  bool is_rethrow_ = false;
};

}
}
}

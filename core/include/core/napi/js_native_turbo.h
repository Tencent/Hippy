/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
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

#include "core/napi/js_native_api.h"
#include "core/napi/js_native_api_types.h"

namespace hippy {
namespace napi {

class TurboEnv;
class HostObject;

using HostFunctionType = std::function<std::shared_ptr<CtxValue>(
    TurboEnv &turbo_env,
    const std::shared_ptr<CtxValue> &this_val,
    const std::shared_ptr<CtxValue> *args,
    size_t count)>;

class TurboEnv {
 public:
  TurboEnv(std::shared_ptr<Ctx> context);
  virtual ~TurboEnv();

  std::shared_ptr<Ctx> context_;

  virtual std::shared_ptr<CtxValue> CreateObject(
      const std::shared_ptr<HostObject> &host_object) = 0;
  virtual std::shared_ptr<CtxValue> CreateFunction(
      const std::shared_ptr<CtxValue> &name,
      int param_count,
      HostFunctionType func) = 0;
  virtual std::shared_ptr<HostObject> GetHostObject(
      std::shared_ptr<CtxValue> value) = 0;
};

class HostObject {
 public:
  virtual ~HostObject();

  virtual std::shared_ptr<CtxValue> Get(
      TurboEnv &,
      const std::shared_ptr<CtxValue> &prop_name);
  virtual void Set(TurboEnv &,
                   const std::shared_ptr<CtxValue> &name,
                   const std::shared_ptr<CtxValue> &value);
  virtual std::vector<std::shared_ptr<CtxValue>> GetPropertyNames(TurboEnv &);
};

class HippyTurboModule : public HostObject {
 public:
  HippyTurboModule(std::string name);
  virtual ~HippyTurboModule();

  std::string name_;
  HostFunctionType callback_;

  virtual std::shared_ptr<CtxValue> Get(
      TurboEnv &,
      const std::shared_ptr<CtxValue> &prop_name) override;
  virtual void Set(TurboEnv &,
                   const std::shared_ptr<CtxValue> &,
                   const std::shared_ptr<CtxValue> &value) override;
  virtual std::vector<std::shared_ptr<CtxValue>> GetPropertyNames(
      TurboEnv &) override;
};

}  // namespace napi
}  // namespace hippy

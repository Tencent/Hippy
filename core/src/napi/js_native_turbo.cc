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

#include <core/napi/js_native_turbo.h>

#include <utility>
#include <vector>

namespace hippy {
namespace napi {

TurboEnv::TurboEnv(std::shared_ptr<Ctx> context)
    : context_(std::move(context)) {}
TurboEnv::~TurboEnv() = default;

HostObject::~HostObject() = default;

std::shared_ptr<CtxValue> HostObject::Get(
    TurboEnv &turbo_env,
    const std::shared_ptr<CtxValue> &prop_name) {
  std::shared_ptr<Ctx> context = turbo_env.context_;
  return context->CreateNull();
}

void HostObject::Set(TurboEnv &,
                     const std::shared_ptr<CtxValue> &name,
                     const std::shared_ptr<CtxValue> &value) {}

std::vector<std::shared_ptr<CtxValue>> HostObject::GetPropertyNames(
    TurboEnv &) {
  std::vector<std::shared_ptr<CtxValue>> values;
  return values;
}

HippyTurboModule::HippyTurboModule(std::string name) : name_(std::move(name)) {}
HippyTurboModule::~HippyTurboModule() = default;

void HippyTurboModule::Set(TurboEnv &,
                           const std::shared_ptr<CtxValue> &name,
                           const std::shared_ptr<CtxValue> &value) {}

std::shared_ptr<CtxValue> HippyTurboModule::Get(
    TurboEnv &turbo_env,
    const std::shared_ptr<CtxValue> &prop_name) {
  return turbo_env.CreateFunction(
      prop_name, 0,
      [this](TurboEnv &env, const std::shared_ptr<CtxValue> &thisVal,
             const std::shared_ptr<CtxValue> *args, size_t count) {
        std::shared_ptr<CtxValue> res =
            this->callback_(env, thisVal, args, count);
        return res;
      });
}

std::vector<std::shared_ptr<CtxValue>> HippyTurboModule::GetPropertyNames(
    TurboEnv &) {
  std::vector<std::shared_ptr<CtxValue>> values;
  return values;
}

}  // namespace napi
}  // namespace hippy

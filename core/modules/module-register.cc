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

#include "core/modules/module-register.h"

#include <mutex>  // NOLINT(build/c++11)

#include "core/engine-impl.h"
#include "core/engine.h"
#include "core/environment.h"

namespace napi = ::hippy::napi;

ModuleRegister* ModuleRegister::instance() {
  static ModuleRegister* _in = nullptr;
  static std::once_flag flag;

  std::call_once(flag, [] { _in = new ModuleRegister(); });

  return _in;
}

ModuleBase* ModuleRegister::GetModuleFromContext(
    napi::napi_context ctx,
    const std::string& module_name) {
  // TODO(howlpan):  Easy to deadlock；optimization this logic, use pass the
  // parameters Engine, without GetEngineWithContext to get Engine;
  std::shared_ptr<Engine> pEngine =
      EngineImpl::instance()->GetEngineWithContext(ctx).lock();
  if (!pEngine)
    return nullptr;

  std::shared_ptr<Environment> pEnv = pEngine->GetEnvironment(ctx).lock();
  if (!pEnv)
    return nullptr;

  return pEnv->getModule(module_name);
}

void ModuleRegister::AddModuleToEnv(napi::napi_context ctx,
                                    const std::string& module_name,
                                    std::unique_ptr<ModuleBase> module) {
  if (!module)
    return;

  std::shared_ptr<Engine> pEngine =
      EngineImpl::instance()->GetEngineWithContext(ctx).lock();
  if (!pEngine)
    return;

  std::shared_ptr<Environment> pEnv = pEngine->GetEnvironment(ctx).lock();
  if (!pEnv)
    return;

  pEnv->addModule(module_name, std::move(module));
}

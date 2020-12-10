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

#include "core/engine-impl.h"
#include "core/base/logging.h"
#include "core/environment.h"

// namespace hippy {
// namespace core {

namespace napi = ::hippy::napi;

EngineImpl* EngineImpl::instance() {
  static std::once_flag flag;
  static EngineImpl* _in = nullptr;

  std::call_once(flag, [] { _in = new EngineImpl(); });

  return _in;
}

std::weak_ptr<Engine> EngineImpl::CreateEngine(Engine::EngineId engine_id) {
  std::lock_guard<std::mutex> lock(m_mutex);

  std::shared_ptr<Engine> engine;
  if (engine_id == kDefaultEngineId) {
    engine = std::make_shared<Engine>(engine_id);
    engine_list.push_back(engine);
  } else {
    engine = GetEngineNoLock(engine_id);
    if (engine == nullptr) {
      engine = std::make_shared<Engine>(engine_id);
      engine_list.push_back(engine);
    }
  }

  return engine;
}

std::weak_ptr<Engine> EngineImpl::GetEngineWithContext(
    napi::napi_context context) {
  std::lock_guard<std::mutex> lock(m_mutex);

  for (auto& it : engine_list) {
    for (auto& ctx : it->env_list_) {
      if (ctx->getContext() == context) {
        return it;
      }
    }
  }

  return std::weak_ptr<Engine>();
}


std::weak_ptr<Environment> EngineImpl::GetEnvWithContext(
    napi::napi_context context) {
  std::lock_guard<std::mutex> lock(m_mutex);

  for (auto& it : engine_list) {
    for (auto& env : it->env_list_) {
      if (env->getContext() == context) {
        return env;
      }
    }
  }

  return std::weak_ptr<Environment>();
}

void EngineImpl::RemoveEngine(std::weak_ptr<Engine> engine) {
  std::shared_ptr<Engine> strong_engine = engine.lock();
  if (strong_engine->id_ != kDebuggerEngineId) {
    if (strong_engine) {
      strong_engine->TerminateRunner();
    }

    std::lock_guard<std::mutex> lock(m_mutex);

    auto item = std::find(std::begin(engine_list), std::end(engine_list),
                          strong_engine);
    if (item != engine_list.end()) {
      engine_list.erase(item);
    }
  }
}

std::shared_ptr<Engine> EngineImpl::GetEngineNoLock(
    Engine::EngineId engine_id) {
  for (const auto& engine : engine_list) {
    if (engine->id_ == engine_id) {
      return engine;
    }
  }

  return nullptr;
}
//} //namespace core
//} //namespace hippy

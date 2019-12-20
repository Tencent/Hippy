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

#ifndef CORE_ENGINE_IMPL_H_
#define CORE_ENGINE_IMPL_H_

#include <stdio.h>
#include <memory>
#include <mutex>  // NOLINT(build/c++11)
#include <vector>

#include "core/napi/js-native-api-types.h"
#include "engine.h"

// namespace hippy {
// namespace core {

class Engine;
class Environment;
class EngineImpl {
 public:
  static EngineImpl* instance();

  std::weak_ptr<Engine> CreateEngine(
      Engine::EngineId engine_id = kDefaultEngineId);
  std::weak_ptr<Engine> GetEngineWithContext(hippy::napi::napi_context context);
  std::weak_ptr<Environment> GetEnvWithContext(hippy::napi::napi_context context);

  void RemoveEngine(std::weak_ptr<Engine> engine);

 private:
  std::shared_ptr<Engine> GetEngineNoLock(Engine::EngineId engine_id);

  friend class Engine;
  std::vector<std::shared_ptr<Engine>> engine_list;
  std::mutex m_mutex;

 public:
  EngineImpl() = default;
  ~EngineImpl() = default;

  static constexpr Engine::EngineId kDefaultEngineId = -1;
  static constexpr Engine::EngineId kDebuggerEngineId = -9999;
};

//} //namespace core
//} //namespace hippy

#endif /* CORE_ENGINE_IMPL_H_ */

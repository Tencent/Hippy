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

#ifndef CORE_ENVIRONMENT_H_
#define CORE_ENVIRONMENT_H_

#include <string>
#include <unordered_map>

#include "core/base/common.h"
#include "core/napi/js-native-api.h"

class Engine;
class ModuleBase;

class Environment {
 public:
  using RegisterMap = hippy::base::RegisterMap;
    
  explicit Environment(const std::string& name = "", std::unique_ptr<RegisterMap> map = std::unique_ptr<RegisterMap>(), bool debug_mode = false);
  ~Environment();

  bool loadModules();

  hippy::napi::napi_context getContext() { return context_; }
  std::unique_ptr<RegisterMap>& GetRegisterMap() { return map_;}
  Engine* GetEngine();
  const std::string& GetName() { return name_; }

  ModuleBase* getModule(const std::string& moduleName);
  void addModule(const std::string& name, std::unique_ptr<ModuleBase> module);

  void SendMessage(const std::string& content_name);
  void RunJavaScript(const std::string& js);

  void EnterContext();
  void ExitContext();

 private:
  void Initialized(std::weak_ptr<Engine> engine);
  void registerGlobalModule();

 private:
  std::weak_ptr<Engine> engine_;
  hippy::napi::napi_context context_;
  std::unique_ptr<RegisterMap> map_;
  std::unordered_map<std::string, std::unique_ptr<ModuleBase>> modules_;

 private:
  friend class Engine;

  std::string name_;
};

#endif  // CORE_ENVIRONMENT_H_

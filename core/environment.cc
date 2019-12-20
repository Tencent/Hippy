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

#include "core/environment.h"

#include <memory>
#include <string>
#include <vector>

#include "core/base/logging.h"
#include "core/engine.h"
#include "core/modules/module-register.h"
#include "core/napi/native-source-code.h"
#include "core/task/javascript-task-runner.h"
#include "core/task/javascript-task.h"

namespace napi = ::hippy::napi;

Environment::Environment(const std::string& name, std::unique_ptr<RegisterMap> map, bool debug_mode)
    : context_(nullptr), map_(std::move(map)), name_(name) {}

Environment::~Environment() {
  JavaScriptTask::Function callback =
      [context = context_,
       modules =
           std::make_unique<decltype(modules_)>(std::move(modules_)).release(),
       engine_weak = engine_] {
        std::unique_ptr<decltype(modules_)>{modules};
        std::shared_ptr<Engine> engine = engine_weak.lock();
        if (engine) {
          napi_context_release(engine->GetVM(), context);
        }
      };

  std::shared_ptr<Engine> engine = engine_.lock();
  if (engine) {
    if (engine->jsRunner()->is_js_thread()) {
      callback();
    } else {
      std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
      task->callback = callback;
      engine->jsRunner()->postTask(task);
    }
  }
}

/*
 js 加载一共分为三个部分：
 1.加载js sdk，注册全局变量，js system land，变量隔离
 2.加载react.js or vue.js
 3.加载业务index.js，js user land
 */
bool Environment::loadModules() {
  JavaScriptTask::Function callback = [this] {
    if (context_ == nullptr) {
      return;
    }
    napi::napi_register_global_in_js(context_);

    //HIPPY_LOG(hippy::Debug, "start loadModules");

    auto source_code = hippy::GetNativeSourceCode("bootstrap.js");
    HIPPY_DCHECK(source_code.data && source_code.length);

    napi::napi_value function = napi::napi_evaluate_javascript(
        context_, source_code.data, source_code.length, "bootstrap.js");
    bool isFunc = napi::napi_is_function(context_, function);
    HIPPY_CHECK_WITH_MSG(isFunc == true,
                         "bootstrap don't return function, register fail!!!");
    if (!isFunc) {
      const char* js = reinterpret_cast<const char*>(source_code.data);
      HIPPY_LOG(hippy::Error,
                "bootstrap return not function, js = %s, len = %d", js,
                source_code.length);
      HIPPY_LOG(hippy::Error,
                "bootstrap return not function, len = %d", source_code.length);
      return;
    }

    napi::napi_value internalBinding =
        napi::napi_get_internal_binding(context_);
    napi::napi_value retValue =
        napi::napi_call_function(context_, function, 1, &internalBinding);

    //HIPPY_LOG(hippy::Debug, "end loadModules");
  };

  std::shared_ptr<Engine> engine = engine_.lock();
  if (engine) {
    if (engine->jsRunner()->is_js_thread()) {
      callback();
    } else {
      std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
      task->callback = callback;
      engine->jsRunner()->postTask(task);
    }
  }

  return true;
}

void Environment::Initialized(std::weak_ptr<Engine> engine) {
    engine_ = engine;
    std::shared_ptr<Engine> strong_engine = engine_.lock();
    if (strong_engine == nullptr) {
        return;
    }

    JavaScriptTask::Function callback = [this] {
      //HIPPY_LOG(hippy::Debug, "initJSFramework create context");
      std::shared_ptr<Engine> strong_engine = engine_.lock();
      if (strong_engine) {
        context_ = napi::napi_create_context(strong_engine->getVM());
        registerGlobalModule();

        HIPPY_LOG(hippy::Debug, "initJSFramework create context end");
      }
    };

    if (strong_engine->jsRunner()->is_js_thread()) {
      callback();
    } else {
      std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
      task->callback = callback;
      strong_engine->jsRunner()->postTask(task);
    }
}

void Environment::registerGlobalModule() {
  napi::napi_add_module_class(context_,
                              ModuleRegister::instance()->GetGlobalList());
  napi::napi_add_module_class(context_,
                              ModuleRegister::instance()->GetInternalList());

  napi::napi_register_global_module(
      context_, ModuleRegister::instance()->GetGlobalList());
}

ModuleBase* Environment::getModule(const std::string& moduleName) {
  auto it = modules_.find(moduleName);
  return it != modules_.end() ? it->second.get() : nullptr;
}

void Environment::addModule(const std::string& name,
                            std::unique_ptr<ModuleBase> module) {
  modules_.insert({name, std::move(module)});
}

Engine* Environment::GetEngine() {
  std::shared_ptr<Engine> engine = engine_.lock();
  if (!engine) {
    return nullptr;
  }
  
  return engine.get();
}

void Environment::SendMessage(const std::string& content_name) {
//    Environment* env = m_pEngine->GetEnvironment(content_name);
//    if (env == nullptr) {
//        return;
//    }
//
//    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
//    task->callback = []{};
//    env->m_pEngine->jsRunner()->postTask(task);
}

void Environment::RunJavaScript(const std::string& js) {
  JavaScriptTask::Function callback = [=] {
    if (context_ == nullptr) {
      return;
    }
    const uint8_t* javascript = reinterpret_cast<const uint8_t*>(js.c_str());
    napi::napi_evaluate_javascript(context_, javascript, js.length(), "");
  };

  std::shared_ptr<Engine> engine = engine_.lock();
  if (engine) {
    if (engine->jsRunner()->is_js_thread()) {
      callback();
    } else {
      std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
      task->callback = callback;
      engine->jsRunner()->postTask(task);
    }
  }
}

void Environment::EnterContext() {
  napi::napi_enter_context(context_);
}

void Environment::ExitContext() {
  napi::napi_exit_context(context_);
}

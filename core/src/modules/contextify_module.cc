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

#include "core/modules/contextify_module.h"

#include <string.h>

#include <memory>
#include <string>

#include "core/base/logging.h"
#include "core/base/uri_loader.h"
#include "core/modules/module_register.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api.h"
#include "core/napi/js_native_api_types.h"
#include "core/napi/native_source_code.h"
#include "core/task/common_task.h"
#include "core/task/javascript_task.h"

REGISTER_MODULE(ContextifyModule, RunInThisContext)
REGISTER_MODULE(ContextifyModule, LoadUriContent)

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using TryCatch = hippy::napi::TryCatch;
using UriLoader = hippy::base::UriLoader;

void ContextifyModule::RunInThisContext(const hippy::napi::CallbackInfo& info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  HIPPY_CHECK(context);

  std::string key;
  if (!context->GetValueString(info[0], &key)) {
    info.GetExceptionValue()->Set(
        context, "The first argument must be non-empty string.");
    return;
  }

  HIPPY_DLOG(hippy::Debug, "RunInThisContext key = %s", key.c_str());
  auto source_code = hippy::GetNativeSourceCode(key.c_str());
  std::shared_ptr<TryCatch> try_catch = CreateTryCatchScope(true, context);
  try_catch->SetVerbose(true);
  std::shared_ptr<CtxValue> ret =
      context->RunScript(source_code.data_, source_code.length_, key.c_str(), false, nullptr);
  if (try_catch->HasCaught()) {
    HIPPY_LOG(hippy::Error, "GetNativeSourceCode error = %s", try_catch->GetExceptionMsg().c_str());
    info.GetExceptionValue()->Set(try_catch->Exception());
  } else {
    info.GetReturnValue()->Set(ret);
  }
}

void ContextifyModule::RemoveCBFunc(const std::string& uri) {
  cb_func_map_.erase(uri);
}

void ContextifyModule::LoadUriContent(const CallbackInfo& info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<hippy::napi::Ctx> context = scope->GetContext();
  HIPPY_CHECK(context);

  std::string key;
  if (!context->GetValueString(info[0], &key)) {
    info.GetExceptionValue()->Set(
        context, "The first argument must be non-empty string.");
    return;
  }

  std::shared_ptr<UriLoader> loader = scope->GetUriLoader();
  std::string uri = loader->Normalize(key);

  std::shared_ptr<hippy::napi::CtxValue> param = info[1];
  std::shared_ptr<hippy::napi::CtxValue> function;
  hippy::napi::Encoding encode = hippy::napi::UNKNOWN_ENCODING;
  double encode_num = 0;
  if (context->GetValueNumber(param, &encode_num)) {
    encode = hippy::napi::Encoding((int)encode_num);
    function = info[2];
  } else {
    function = info[1];
  }
  if (context->IsFunction(function)) {
    cb_func_map_[uri] = function;
  } else {
    HIPPY_DLOG(hippy::Debug, "cb is not function");
    function = nullptr;
  }

  HIPPY_DLOG(hippy::Debug, "Require key = %s", key.c_str());
  auto runner = scope->GetWorkerTaskRunner();
  std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();

  std::weak_ptr<Scope> weak_scope = scope;
  std::weak_ptr<hippy::napi::CtxValue> weak_function = function;

  task->func_ = [this, weak_scope, weak_function, encode, uri]() {
    std::shared_ptr<Scope> scope = weak_scope.lock();
    if (!scope) {
      return;
    }

    std::string cur_dir;
    std::string file_name;
    auto pos = uri.find_last_of('/');
    if (pos != -1) {
      cur_dir = uri.substr(0, pos + 1);
      file_name = uri.substr(pos + 1);
    } else {
      file_name = uri;
    }
    std::shared_ptr<UriLoader> loader = scope->GetUriLoader();
    const std::string code = loader->Load(uri);
    if (code.empty()) {
      HIPPY_LOG(hippy::Warning, "Load uri = %s, code empty", uri.c_str());
    } else {
      HIPPY_DLOG(hippy::Debug,
                 "Load uri = %s, len = %d, encode = %d, code = %s", uri.c_str(),
                 code.length(), encode, code.c_str());
    }
    std::shared_ptr<JavaScriptTask> js_task =
        std::make_shared<JavaScriptTask>();
    js_task->callback = [this, weak_scope, weak_function,
                         move_code = std::move(code), cur_dir, file_name,
                         encode, uri]() {
      std::shared_ptr<Scope> scope = weak_scope.lock();
      if (!scope) {
        return;
      }

      std::shared_ptr<Ctx> ctx = scope->GetContext();
      std::shared_ptr<CtxValue> error;
      if (!move_code.empty()) {
        auto last_dir_str_obj = ctx->GetGlobalStrVar("__HIPPYCURDIR__");
        HIPPY_DLOG(hippy::Debug, "__HIPPYCURDIR__ cur_dir = %s",
                   cur_dir.c_str());
        ctx->SetGlobalStrVar("__HIPPYCURDIR__", cur_dir.c_str());
        std::shared_ptr<TryCatch> try_catch =
            CreateTryCatchScope(true, scope->GetContext());
        try_catch->SetVerbose(true);
        scope->RunJS(std::move(move_code), file_name, encode);
        ctx->SetGlobalObjVar("__HIPPYCURDIR__", last_dir_str_obj);
        std::string last_dir_str;
        ctx->GetValueString(last_dir_str_obj, &last_dir_str);
        HIPPY_DLOG(hippy::Debug, "restore __HIPPYCURDIR__ = %s",
                   last_dir_str.c_str());
        if (try_catch->HasCaught()) {
          error = ctx->CreateNull();
        } else {
          error = try_catch->Exception();
        }
      } else {
        error = ctx->CreateJsError(uri + " not found");
      }

      std::shared_ptr<CtxValue> function = weak_function.lock();
      if (function) {
        HIPPY_DLOG(hippy::Debug, "run js cb");
        std::shared_ptr<CtxValue> argv[] = {error};
        ctx->CallFunction(function, 1, argv);
        RemoveCBFunc(uri);
      }
    };
    scope->GetTaskRunner()->PostTask(js_task);
  };
  runner->PostTask(std::move(task));

  info.GetReturnValue()->SetUndefined();
}

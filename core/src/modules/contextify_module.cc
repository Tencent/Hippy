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

#include <cstring>
#include <memory>
#include <string>

#include "base/logging.h"
#include "core/base/uri_loader.h"
#include "core/napi/js_try_catch.h"
#include "core/task/common_task.h"
#include "core/task/javascript_task.h"
#include "core/vm/native_source_code.h"
#if JS_V8
#include "core/napi/v8/v8_ctx.h"
#endif

GEN_INVOKE_CB(ContextifyModule, RunInThisContext) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(ContextifyModule, LoadUntrustedContent) // NOLINT(cert-err58-cpp)

using unicode_string_view = tdf::base::unicode_string_view;
using u8string = unicode_string_view::u8string;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using TryCatch = hippy::napi::TryCatch;
using UriLoader = hippy::base::UriLoader;
using StringViewUtils = hippy::base::StringViewUtils;

constexpr char kCurDir[] = "__HIPPYCURDIR__";

void ContextifyModule::RunInThisContext(const hippy::napi::CallbackInfo& info, void* data) { // NOLINT(readability-convert-member-functions-to-static)
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto context = scope->GetContext();
#ifdef JS_V8
  auto ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(context);
#else
  auto ctx = context;
#endif
  TDF_BASE_CHECK(context);

  unicode_string_view key;
  if (!ctx->GetValueString(info[0], &key)) {
    info.GetExceptionValue()->Set(
        context, "The first argument must be non-empty string.");
    return;
  }

  TDF_BASE_DLOG(INFO) << "RunInThisContext key = " << key;
  const auto& source_code =
      hippy::GetNativeSourceCode(StringViewUtils::ToU8StdStr(key));
  std::shared_ptr<TryCatch> try_catch = CreateTryCatchScope(true, context);
  unicode_string_view str_view(reinterpret_cast<const unicode_string_view::char8_t_ *>(source_code.data_),
                               source_code.length_);
#ifdef JS_V8
  auto ret = ctx->RunScript(str_view, key, false, nullptr, false);
#else
  auto ret = context->RunScript(str_view, key);
#endif
  if (try_catch->HasCaught()) {
    TDF_BASE_DLOG(ERROR) << "GetNativeSourceCode error = "
                         << try_catch->GetExceptionMsg();
    info.GetExceptionValue()->Set(try_catch->Exception());
  } else {
    info.GetReturnValue()->Set(ret);
  }
}

void ContextifyModule::RemoveCBFunc(const unicode_string_view& uri) {
  cb_func_map_.erase(uri);
}

void ContextifyModule::LoadUntrustedContent(const CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto context = scope->GetContext();
  unicode_string_view uri;
  if (!context->GetValueString(info[0], &uri)) {
    info.GetExceptionValue()->Set(
        context, "The first argument must be non-empty string.");
    return;
  }
  TDF_BASE_DLOG(INFO) << "uri = " << uri;

  std::shared_ptr<UriLoader> loader = scope->GetUriLoader();
  std::shared_ptr<hippy::napi::CtxValue> param = info[1];
  std::shared_ptr<hippy::napi::CtxValue> function;
  hippy::napi::Encoding encode = hippy::napi::UNKNOWN_ENCODING;
  double encode_num = 0;
  if (context->GetValueNumber(param, &encode_num)) {
    encode = hippy::napi::Encoding(static_cast<int>(encode_num));
    function = info[2];
  } else {
    function = info[1];
  }
  if (context->IsFunction(function)) {
    cb_func_map_[uri] = function;
  } else {
    TDF_BASE_DLOG(INFO) << "cb is not function";
    function = nullptr;
  }

  TDF_BASE_DLOG(INFO) << "RequestUntrustedContent uri = " << uri;

  std::weak_ptr<Scope> weak_scope = scope;
  std::weak_ptr<hippy::napi::CtxValue> weak_function = function;

  std::function<void(u8string)> cb = [this, weak_scope, weak_function, encode, uri](u8string code) {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }

    unicode_string_view cur_dir;
    unicode_string_view file_name;
    size_t pos = StringViewUtils::FindLastOf(uri, '/', '/', u'/', U'/');
    if (pos != StringViewUtils::npos) {
      cur_dir = StringViewUtils::SubStr(uri, 0, pos + 1);
      size_t len = StringViewUtils::GetLength(uri);
      file_name = StringViewUtils::SubStr(uri, pos + 1, len);
    } else {
      cur_dir = "";
      file_name = uri;
    }

    if (code.empty()) {
      TDF_BASE_DLOG(WARNING) << "Load uri = " << uri << ", code empty";
    } else {
      TDF_BASE_DLOG(INFO) << "Load uri = " << uri << ", len = " << code.length()
                          << ", encode = " << encode
                          << ", code = " << unicode_string_view(code);
    }
    auto js_task = std::make_shared<JavaScriptTask>();
    js_task->callback = [this, weak_scope, weak_function,
                         move_code = std::move(code), cur_dir, file_name, uri]() {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }

      std::shared_ptr<Ctx> ctx = scope->GetContext();
      std::shared_ptr<CtxValue> error = nullptr;
      if (!move_code.empty()) {
        auto global_object = ctx->GetGlobalObject();
        auto cur_dir_key = ctx->CreateString(kCurDir);
        auto last_dir_str_obj = ctx->GetProperty(global_object, cur_dir_key);
        TDF_BASE_DLOG(INFO) << "__HIPPYCURDIR__ cur_dir = " << cur_dir;
        auto cur_dir_value = ctx->CreateString(cur_dir);
        ctx->SetProperty(global_object, cur_dir_key, cur_dir_value);
        std::shared_ptr<TryCatch> try_catch = CreateTryCatchScope(true, scope->GetContext());
        try_catch->SetVerbose(true);
        unicode_string_view view_code(move_code);
        scope->RunJS(view_code, file_name);
        ctx->SetProperty(global_object, cur_dir_key, last_dir_str_obj, hippy::napi::PropertyAttribute::ReadOnly);
        unicode_string_view view_last_dir_str("");
        ctx->GetValueString(last_dir_str_obj, &view_last_dir_str);
        TDF_BASE_DLOG(INFO) << "restore __HIPPYCURDIR__ = " << view_last_dir_str;
        if (try_catch->HasCaught()) {
          error = try_catch->Exception();
          TDF_BASE_DLOG(ERROR) << "RequestUntrustedContent error = "
                               << try_catch->GetExceptionMsg();
        }
      } else {
        unicode_string_view err_msg = uri + " not found";
        error = ctx->CreateError(unicode_string_view(err_msg));
      }

      std::shared_ptr<CtxValue> function = weak_function.lock();
      if (function) {
        TDF_BASE_DLOG(INFO) << "run js cb";
        if (!error) {
          error = ctx->CreateNull();
        }
        std::shared_ptr<CtxValue> argv[] = {error};
        ctx->CallFunction(function, 1, argv);
        RemoveCBFunc(uri);
      }
    };
    auto runner = scope->GetTaskRunner();
    if (runner) {
      runner->PostTask(js_task);
    }
  };
  loader->RequestUntrustedContent(uri, cb);
  info.GetReturnValue()->SetUndefined();
}

std::shared_ptr<CtxValue> ContextifyModule::BindFunction(std::shared_ptr<Scope> scope,
                                                         std::shared_ptr<CtxValue> rest_args[]) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("RunInThisContext");
  auto wrapper = std::make_unique<hippy::napi::FuncWrapper>(InvokeContextifyModuleRunInThisContext, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFuncWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("LoadUntrustedContent");
  wrapper = std::make_unique<hippy::napi::FuncWrapper>(InvokeContextifyModuleLoadUntrustedContent, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFuncWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

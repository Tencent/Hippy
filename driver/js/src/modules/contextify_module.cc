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

#include "driver/modules/contextify_module.h"

#include <cstring>
#include <memory>
#include <string>

#include "driver/modules/module_register.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/napi/js_try_catch.h"
#include "driver/vm/native_source_code.h"
#include "footstone/logging.h"
#include "footstone/task.h"

#if JS_V8
#include "driver/napi/v8/v8_ctx.h"
#include "driver/napi/v8/v8_ctx_value.h"
#include "driver/napi/v8/v8_try_catch.h"
#endif

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using u8string = string_view::u8string;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using TryCatch = hippy::napi::TryCatch;

constexpr char kCurDir[] = "__HIPPYCURDIR__";


namespace hippy {
inline namespace driver {
inline namespace module {

GEN_INVOKE_CB(ContextifyModule, RunInThisContext) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(ContextifyModule, LoadUntrustedContent) // NOLINT(cert-err58-cpp)

void ContextifyModule::RunInThisContext(hippy::napi::CallbackInfo &info, void* data) { // NOLINT(readability-convert-member-functions-to-static)
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
#ifdef JS_V8
  auto context = std::static_pointer_cast<hippy::napi::V8Ctx>(scope->GetContext());
#else
  auto context = scope->GetContext();
#endif

  string_view key;
  if (!context->GetValueString(info[0], &key)) {
    info.GetExceptionValue()->Set(context, "The first argument must be non-empty string.");
    return;
  }

  FOOTSTONE_DLOG(INFO) << "RunInThisContext key = " << key;
  const auto &source_code = hippy::GetNativeSourceCode(StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      key, string_view::Encoding::Utf8).utf8_value()));
  std::shared_ptr<TryCatch> try_catch = CreateTryCatchScope(true, context);
  string_view str_view(reinterpret_cast<const string_view::char8_t_ *>(source_code.data_), source_code.length_);
#ifdef JS_V8
  auto ret = context->RunScript(str_view, key, false, nullptr, false);
#else
  auto ret = context->RunScript(str_view, key);
#endif
  if (try_catch->HasCaught()) {
    FOOTSTONE_DLOG(ERROR) << "GetNativeSourceCode error = " << try_catch->GetExceptionMessage();
    info.GetExceptionValue()->Set(try_catch->Exception());
  } else {
    info.GetReturnValue()->Set(ret);
  }
}

void ContextifyModule::RemoveCBFunc(const string_view& uri) {
  cb_func_map_.erase(uri);
}

void ContextifyModule::LoadUntrustedContent(CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  if (!scope) {
    return;
  }
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);
  if (!context) {
    return;
  }
  string_view uri;
  if (!context->GetValueString(info[0], &uri)) {
    info.GetExceptionValue()->Set(context, "The first argument must be non-empty string.");
    return;
  }
  FOOTSTONE_DLOG(INFO) << "uri = " << uri;

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
    FOOTSTONE_DLOG(INFO) << "cb is not function";
    function = nullptr;
  }

  FOOTSTONE_DLOG(INFO) << "RequestUntrustedContent uri = " << uri;

  std::weak_ptr<Scope> weak_scope = scope;
  std::weak_ptr<hippy::napi::CtxValue> weak_function = function;

  auto cb = [this, weak_scope, weak_function, encode, uri](
      UriLoader::RetCode ret_code, const std::unordered_map<std::string, std::string>&, UriLoader::bytes content) {
    std::shared_ptr<Scope> scope = weak_scope.lock();
    if (!scope) {
      return;
    }

    string_view cur_dir;
    string_view file_name;
    size_t pos = StringViewUtils::FindLastOf(uri, '/', '/', u'/', U'/');
    if (pos != static_cast<size_t>(-1)) {
      cur_dir = StringViewUtils::SubStr(uri, 0, pos + 1);
      size_t len = StringViewUtils::GetLength(uri);
      file_name = StringViewUtils::SubStr(uri, pos + 1, len);
    } else {
      cur_dir = "";
      file_name = uri;
    }

    if (ret_code != UriLoader::RetCode::Success || content.empty()) {
      FOOTSTONE_LOG(WARNING) << "Load uri = " << uri << ", code empty";
    } else {
      FOOTSTONE_DLOG(INFO) << "Load uri = " << uri << ", len = " << content.length()
                           << ", encode = " << encode
                           << ", code = " << string_view(content);
    }
    auto callback = [this, weak_scope, weak_function, move_code = std::move(content), cur_dir, file_name, uri]() {
      std::shared_ptr<Scope> scope = weak_scope.lock();
      if (!scope) {
        return;
      }

      std::shared_ptr<Ctx> ctx = scope->GetContext();
      std::shared_ptr<CtxValue> error = nullptr;
      if (!move_code.empty()) {
        auto global_object = ctx->GetGlobalObject();
        auto cur_dir_key = ctx->CreateString(kCurDir);
        auto last_dir_str_obj = ctx->GetProperty(global_object, cur_dir_key);
        FOOTSTONE_DLOG(INFO) << "__HIPPYCURDIR__ cur_dir = " << cur_dir;
        auto cur_dir_value = ctx->CreateString(cur_dir);
        ctx->SetProperty(global_object, cur_dir_key, cur_dir_value);
        auto try_catch = CreateTryCatchScope(true, scope->GetContext());
        try_catch->SetVerbose(true);
        string_view view_code(reinterpret_cast<const string_view::char8_t_ *>(move_code.c_str()), move_code.length());
        scope->RunJS(view_code, uri, file_name);
        if (last_dir_str_obj) {
          ctx->SetProperty(global_object, cur_dir_key, last_dir_str_obj, hippy::napi::PropertyAttribute::ReadOnly);
        }
        if (try_catch->HasCaught()) {
          error = try_catch->Exception();
          FOOTSTONE_DLOG(ERROR) << "RequestUntrustedContent error = " << try_catch->GetExceptionMessage();
        }
      } else {
        string_view err_msg = uri + " not found";
        error = ctx->CreateException(string_view(err_msg));
      }

      std::shared_ptr<CtxValue> function = weak_function.lock();
      if (function) {
        FOOTSTONE_DLOG(INFO) << "run js cb";
        if (!error) {
          error = ctx->CreateNull();
        }
        std::shared_ptr<CtxValue> argv[] = {error};
        ctx->CallFunction(function, ctx->GetGlobalObject(), 1, argv);
        RemoveCBFunc(uri);
      }
    };
    auto runner = scope->GetTaskRunner();
    if (runner) {
      runner->PostTask(std::move(callback));
    }
  };

  auto loader = scope->GetUriLoader().lock();
  FOOTSTONE_CHECK(loader);
  if (!loader) {
    return;
  }
  loader->RequestUntrustedContent(uri, {}, cb);

  info.GetReturnValue()->SetUndefined();
}

std::shared_ptr<CtxValue> ContextifyModule::BindFunction(std::shared_ptr<Scope> scope,
                                                         std::shared_ptr<CtxValue> rest_args[]) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("RunInThisContext");
  auto wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeContextifyModuleRunInThisContext, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("LoadUntrustedContent");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeContextifyModuleLoadUntrustedContent, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

}
}
}


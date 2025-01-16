/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "driver/vm/jsh/jsh_vm.h"

#include "footstone/check.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "dom/dom_event.h"
#include "driver/napi/jsh/jsh_ctx.h"
#include "driver/napi/jsh/jsh_ctx_value.h"
#include "driver/napi/jsh/jsh_try_catch.h"
#include <sys/prctl.h>

using string_view = footstone::string_view;
using Ctx = hippy::napi::Ctx;
using JSHCtx = hippy::napi::JSHCtx;
using CtxValue = hippy::napi::CtxValue;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;


namespace hippy {
inline namespace driver {
inline namespace vm {

static bool platform_initted = false;
static std::mutex mutex;

JSHVM::JSHVM(const std::shared_ptr<JSHVMInitParam>& param) : VM(param) {
  JSVM_VMInfo vmInfo;
  OH_JSVM_GetVMInfo(&vmInfo);
  FOOTSTONE_DLOG(INFO) << "JSHVM begin, apiVersion: " << vmInfo.apiVersion
    << ", engine: " << vmInfo.engine 
    << ", version: " << vmInfo.version;
  {
    std::lock_guard<std::mutex> lock(mutex);
    if (!platform_initted) {
      
      // 临时关闭管控，ohos beta3 版本修复后，不需要了。
      // prctl(0x6a6974, 0, 0);
      
      JSVM_InitOptions init_options;
      memset(&init_options, 0, sizeof(init_options));
      // 说明：这里init返回结果不需要判断，有可能App其它地方已经init过JSVM，这里会返回错误码9，但没影响。
      auto status = OH_JSVM_Init(&init_options);
      FOOTSTONE_LOG(INFO) << "JSHVM OH_JSVM_Init result: " << status;
      platform_initted = true;
#ifdef ENABLE_INSPECTOR
      auto trace = reinterpret_cast<v8::platform::tracing::TracingController*>(platform->GetTracingController());
      devtools::DevtoolsDataSource::OnGlobalTracingControlGenerate(trace);
#endif
    }
  }
  
  JSVM_CreateVMOptions options;
  memset(&options, 0, sizeof(options));
  auto status = OH_JSVM_CreateVM(&options, &vm_);
  FOOTSTONE_CHECK(status == JSVM_OK);
  status = OH_JSVM_OpenVMScope(vm_, &vm_scope_);
  FOOTSTONE_CHECK(status == JSVM_OK);

  enable_v8_serialization_ = param->enable_v8_serialization;
  FOOTSTONE_DLOG(INFO) << "JSHVM end";
}

static void UncaughtExceptionMessageCallback(JSVM_Env env, JSVM_Value error, void *external_data) {
  void *scope_data =  GetPointerInInstanceData(env, kJSHScopeWrapperIndex);
  
  JSVM_Value stack = nullptr;
  OH_JSVM_GetNamedProperty(env, error, "stack", &stack);
  JSVM_Value message = nullptr;
  OH_JSVM_GetNamedProperty(env, error, "message", &message);
  
  CallbackInfo callback_info;
  callback_info.SetSlot(scope_data);
  callback_info.AddValue(std::make_shared<JSHCtxValue>(env, error));
  callback_info.AddValue(std::make_shared<JSHCtxValue>(env, message));
  callback_info.AddValue(std::make_shared<JSHCtxValue>(env, stack));

  FOOTSTONE_CHECK(external_data);
  auto* func_wrapper = reinterpret_cast<FunctionWrapper*>(external_data);
  FOOTSTONE_CHECK(func_wrapper && func_wrapper->callback);
  (func_wrapper->callback)(callback_info, func_wrapper->data);
}

void JSHVM::AddUncaughtExceptionMessageListener(const std::unique_ptr<FunctionWrapper>& wrapper) const {
}

JSHVM::~JSHVM() {
  FOOTSTONE_LOG(INFO) << "~JSHVM";

#if defined(ENABLE_INSPECTOR) && !defined(JSH_WITHOUT_INSPECTOR)
  inspector_client_ = nullptr;
#endif
  
  OH_JSVM_CloseVMScope(vm_, vm_scope_);
  vm_scope_ = nullptr;
  OH_JSVM_DestroyVM(vm_);
  vm_ = nullptr;
}

void JSHVM::PlatformDestroy() {
  platform_initted = false;
}

std::shared_ptr<Ctx> JSHVM::CreateContext() {
  FOOTSTONE_DLOG(INFO) << "CreateContext";
  return std::make_shared<JSHCtx>(vm_, UncaughtExceptionMessageCallback, uncaught_exception_.get());
}

string_view JSHVM::ToStringView(JSVM_Env env, JSVM_Value string_value) {
  FOOTSTONE_DCHECK(string_value);
  
  JSHHandleScope handleScope(env);
  
  // JSVM没有判断字符串是UTF16/UTF8/Latin1的接口，这里使用UTF16的API没问题，使用UTF8的API有问题（返回长度>0，但显示文本是乱的）
  size_t result = 0;
  auto status = OH_JSVM_GetValueStringUtf16(env, string_value, NULL, 0, &result);
  if (status != JSVM_OK || result == 0) {
    return "";
  }
  std::u16string two_byte_string;
  two_byte_string.resize(result + 1);
  status = OH_JSVM_GetValueStringUtf16(env, string_value, reinterpret_cast<char16_t*>(&two_byte_string[0]), result + 1, &result);
  FOOTSTONE_DCHECK(status == JSVM_OK);
  two_byte_string.resize(result);

  return string_view(two_byte_string);
}

std::shared_ptr<CtxValue> JSHVM::CreateJSHString(JSVM_Env env, const string_view& str_view) {
  JSHHandleScope handleScope(env);

  JSVM_Value result = 0;
  string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case string_view::Encoding::Latin1: {
      const std::string& one_byte_str = str_view.latin1_value();
      auto status = OH_JSVM_CreateStringLatin1(env, one_byte_str.c_str(), one_byte_str.size(), &result);
      FOOTSTONE_DCHECK(status == JSVM_OK);
      return std::make_shared<JSHCtxValue>(env, result);
    }
    case string_view::Encoding::Utf8: {
      const string_view::u8string& utf8_str = str_view.utf8_value();
      auto status = OH_JSVM_CreateStringUtf8(env, (const char *)utf8_str.c_str(), utf8_str.size(), &result);
      FOOTSTONE_DCHECK(status == JSVM_OK);
      return std::make_shared<JSHCtxValue>(env, result);
    }
    case string_view::Encoding::Utf16: {
      const std::u16string& two_byte_str = str_view.utf16_value();
      auto status = OH_JSVM_CreateStringUtf16(env, two_byte_str.c_str(), two_byte_str.length(), &result);
      FOOTSTONE_DCHECK(status == JSVM_OK);
      return std::make_shared<JSHCtxValue>(env, result);
    }
    default:break;
  }

  FOOTSTONE_UNREACHABLE();
}

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VM::VMInitParam>& param) {
  return std::make_shared<JSHVM>(std::static_pointer_cast<JSHVMInitParam>(param));
}

std::shared_ptr<CtxValue> JSHVM::ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) {
  if (StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }

  auto jsh_ctx = std::static_pointer_cast<JSHCtx>(ctx);
  JSHHandleScope handleScope(jsh_ctx->env_);
  
  auto string_value = JSHVM::CreateJSHString(jsh_ctx->env_, json);
  if (!string_value) {
    return nullptr;
  }
  auto jsh_string_value = std::static_pointer_cast<JSHCtxValue>(string_value);
  JSVM_Value result = nullptr;
  auto status = OH_JSVM_JsonParse(jsh_ctx->env_, jsh_string_value->GetValue(), &result);
  if (status == JSVM_GENERIC_FAILURE) {
    FOOTSTONE_LOG(ERROR) << "JSHVM::ParseJson error, json: " << json;
    return nullptr;
  }
  FOOTSTONE_DCHECK(status == JSVM_OK);
  return std::make_shared<JSHCtxValue>(jsh_ctx->env_, result);
}

JSHVM::DeserializerResult JSHVM::Deserializer(const std::shared_ptr<Ctx>& ctx, const std::string& buffer) {
  return {false, nullptr, ""};
}

}
}
}

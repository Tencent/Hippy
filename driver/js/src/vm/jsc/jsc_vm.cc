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

#include "driver/vm/jsc/jsc_vm.h"

#include "footstone/string_view_utils.h"
#include "driver/napi/jsc/jsc_ctx.h"
#include "driver/napi/jsc/jsc_ctx_value.h"
#include "driver/vm/jsc/jsc_vm.h"

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using Ctx = hippy::napi::Ctx;
using JSCCtx = hippy::napi::JSCCtx;


namespace hippy {
inline namespace driver {
inline namespace vm {

std::set<void*> JSCVM::constructor_data_ptr_set_;
std::mutex JSCVM::mutex_;

std::shared_ptr<CtxValue> JSCVM::ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) {
  if (footstone::StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }
  
  auto jsc_ctx = std::static_pointer_cast<JSCCtx>(ctx);
  auto context = jsc_ctx->context_;
  JSStringRef str_ref = JSCVM::CreateJSCString(json);
  JSValueRef value = JSValueMakeFromJSONString(context, str_ref);
  JSStringRelease(str_ref);
  return std::make_shared<JSCCtxValue>(context, value);
}

std::shared_ptr<Ctx> JSCVM::CreateContext() {
  return std::make_shared<JSCCtx>(vm_, weak_from_this());
}

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VM::VMInitParam>& param) {
  return std::make_shared<JSCVM>();
}

JSStringRef JSCVM::CreateJSCString(const string_view& str_view) {
  string_view::Encoding encoding = str_view.encoding();
  JSStringRef ret;
  switch (encoding) {
    case string_view::Encoding::Unknown: {
      FOOTSTONE_UNREACHABLE();
      break;
    }
    case string_view::Encoding::Utf8: {
      std::string u8_str(reinterpret_cast<const char*>(str_view.utf8_value().c_str()),
                         str_view.utf8_value().length());
      ret = JSStringCreateWithUTF8CString(u8_str.c_str());
      break;
    }
    case string_view::Encoding::Utf16: {
      std::u16string u16_str = str_view.utf16_value();
      ret = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(u16_str.c_str()), u16_str.length());
      break;
    }
    case string_view::Encoding::Latin1:
    case string_view::Encoding::Utf32: {
      std::u16string u16_str = StringViewUtils::ConvertEncoding(str_view, string_view::Encoding::Utf16).utf16_value();
      ret = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(u16_str.c_str()), u16_str.length());
      break;
    }
    default:
      FOOTSTONE_UNIMPLEMENTED();
      break;
  }
  return ret;
}

void JSCVM::SaveConstructorDataPtr(void* ptr) {
  std::lock_guard<std::mutex> lock(mutex_);
  constructor_data_ptr_set_.insert(ptr);
}

void JSCVM::ClearConstructorDataPtr(void* ptr) {
  std::lock_guard<std::mutex> lock(mutex_);
  constructor_data_ptr_set_.erase(ptr);
}

bool JSCVM::IsValidConstructorDataPtr(void* ptr) {
  std::lock_guard<std::mutex> lock(mutex_);
  return constructor_data_ptr_set_.find(ptr) != constructor_data_ptr_set_.end();
}

}
}
}

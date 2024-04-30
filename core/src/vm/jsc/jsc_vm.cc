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

#include "core/vm/jsc/jsc_vm.h"

#include "core/base/string_view_utils.h"
#include "core/napi/jsc/jsc_ctx.h"
#include "core/napi/jsc/jsc_ctx_value.h"

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using Ctx = hippy::napi::Ctx;
using JSCCtx = hippy::napi::JSCCtx;


namespace hippy {
namespace vm {

void JSCVM::RegisterUncaughtExceptionCallback() {}

std::shared_ptr<Ctx> JSCVM::CreateContext() {
  return std::make_shared<JSCCtx>(vm_);
}

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param) {
  return std::make_shared<JSCVM>();
}

JSStringRef JSCVM::CreateJSCString(const unicode_string_view& str_view) {
  unicode_string_view::Encoding encoding = str_view.encoding();
  JSStringRef ret;
  switch (encoding) {
    case unicode_string_view::Encoding::Unknown: {
      TDF_BASE_UNREACHABLE();
      break;
    }
    case unicode_string_view::Encoding::Utf8: {
      std::string u8_str(
          reinterpret_cast<const char*>(str_view.utf8_value().c_str()),
          str_view.utf8_value().length());
      ret = JSStringCreateWithUTF8CString(u8_str.c_str());
      break;
    }
    case unicode_string_view::Encoding::Utf16: {
      std::u16string u16_str = str_view.utf16_value();
      ret = JSStringCreateWithCharacters(
          reinterpret_cast<const JSChar*>(u16_str.c_str()), u16_str.length());
      break;
    }
    case unicode_string_view::Encoding::Latin1:
    case unicode_string_view::Encoding::Utf32: {
      std::u16string u16_str = StringViewUtils::Convert(str_view, unicode_string_view::Encoding::Utf16).utf16_value();
      ret = JSStringCreateWithCharacters(
          reinterpret_cast<const JSChar*>(u16_str.c_str()), u16_str.length());
      break;
    }
    default:
      TDF_BASE_UNIMPLEMENTED();
      break;
  }
  return ret;
}

}
}

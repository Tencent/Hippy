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

#pragma once

#include <cstdlib>
#include <cstring>
#include <string>
#if defined(__ANDROID__) || defined(_WIN32)
#  include "base/unicode_string_view.h"
#  include "core/base/string_view_utils.h"
#  include "v8/v8.h"
#  include "ffi/common_header.h"
#elif __APPLE__
#endif

char16_t* copyChar16(const char16_t* source_char, int length);

char* copyCharToChar(const char* source_char, int length);

#if defined(__ANDROID__) || defined(_WIN32)
using StringViewUtils = hippy::base::StringViewUtils;
using unicode_string_view = tdf::base::unicode_string_view;

EXPORT const char* v8Utf8ValueToCString(const v8::String::Utf8Value& value);

EXPORT unicode_string_view CU16StringToStrView(const char16_t* source_char);

EXPORT const char16_t* StrViewToCU16String(const unicode_string_view& str_view);

#endif

std::string C16CharToString(const char16_t* source_char);

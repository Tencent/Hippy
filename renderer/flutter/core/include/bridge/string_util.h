//
// Created by longquan on 2020/8/23.
//

#ifndef STRING_UTIL_H_
#define STRING_UTIL_H_

#include <cstring>
#include <cstdlib>
#if defined(__ANDROID__) || defined(_WIN32)
#include "core/base/string_view_utils.h"
using StringViewUtils = hippy::base::StringViewUtils;
#include "v8/v8.h"
#include "base/unicode_string_view.h"
#include "runtime.h"
#elif __APPLE__
#endif

char16_t *copyChar16(const char16_t *source_char, int length);

char* copyCharToChar(const char *source_char, int length);

#if defined(__ANDROID__) || defined(_WIN32)

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtil = hippy::base::StringViewUtils;

EXPORT const char *v8Utf8ValueToCString(const v8::String::Utf8Value &value);

EXPORT unicode_string_view CU16StringToStrView(
    const char16_t *source_char);

EXPORT const char16_t *StrViewToCU16String(const unicode_string_view &str_view);

#endif

#endif // STRING_UTIL_H_

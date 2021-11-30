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
#include <stddef.h>
#include <string>
#include <memory>
#include <functional>
#include <utility>

template<typename T> using SP = std::shared_ptr<T>;

#ifdef MK_SP
#undef MK_SP
#endif
#define MK_SP std::make_shared

template<typename T> using UP = std::unique_ptr<T>;

#ifdef MK_UP
#undef MK_UP
#endif

#if _LIBCPP_STD_VER > 11 || defined(__WIN32__)
#define MK_UP std::make_unique
#else  // _LIBCPP_STD_VER > 11
template <typename T, typename... Args>
std::unique_ptr<T> make_unique(Args&&... args) {
  return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}
#define MK_UP make_unique
#endif  // _LIBCPP_STD_VER > 11


#ifdef __WIN32__
#ifdef UNICODE
typedef std::wstring TSTRING;
typedef std::wstringstream TSTRINGSTREAM;
#else
typedef std::string TSTRING;
typedef std::stringstream TSTRINGSTREAM;
#endif
#else
typedef std::string TSTRING;
typedef std::stringstream TSTRINGSTREAM;

// define windows macros on other platform
typedef char TCHAR;
#define TEXT(data) data
#define _tfopen fopen
#endif

#if __WIN32__
#  define PATH_SPLITTER '\\'
#define PATH_SPLITTER_STR "\\"
#else
#define PATH_SPLITTER '/'
#define PATH_SPLITTER_STR "/"
#endif

// Suppress UNUSED warnings
#define HIPPY_USE(expr) \
  do {                  \
    (void)(expr);       \
  } while (0)

// Calculate size of array
#define arraysize(array) (sizeof(ArraySizeHelper(array)))

template <typename CharType, size_t N>
char (&ArraySizeHelper(CharType (&array)[N]))[N];

// Suppress copy
#define DISALLOW_COPY_AND_ASSIGN(Type) \
  Type(const Type&) = delete;          \
  Type& operator=(const Type&) = delete

// Enable move and suppress copy
#define MOVE_ONLY(Type)                       \
  Type(Type&&) noexcept = default;            \
  Type& operator=(Type&&) noexcept = default; \
  DISALLOW_COPY_AND_ASSIGN(Type)

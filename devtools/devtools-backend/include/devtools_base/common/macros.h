//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#pragma once

#if __ANDROID__
#  define TDF_PLATFORM_ANDROID 1
#  define TDF_PLATFORM_MOBILE 1
#elif __APPLE__
#  include <TargetConditionals.h>
#  if TARGET_OS_IPHONE
#    define TDF_PLATFORM_IOS 1
#    define TDF_PLATFORM_MOBILE 1
#  elif TARGET_OS_MAC
#    define TDF_PLATFORM_MAC 1
#    define TDF_PLATFORM_PC 1
#  else
#    error "Unknow Operator System"
#  endif
#elif defined(_WIN32)
#  define TDF_PLATFORM_WINDOWS 1
#  define TDF_PLATFORM_PC 1
#elif __linux__
#  define TDF_PLATFORM_LINUX 1
#  define TDF_PLATFORM_PC 1
#else
#  error "Unknow Operator System"
#endif

#if defined(_WIN32)
#  define TDF_DLL_IMPORT __declspec(dllimport)
#  define TDF_DLL_EXPORT __declspec(dllexport)
#  define TDF_DLL_LOCAL
#else
#  define TDF_DLL_IMPORT __attribute__((visibility("default")))
#  define TDF_DLL_EXPORT __attribute__((visibility("default")))
#  define TDF_DLL_LOCAL __attribute__((visibility("hidden")))
#endif

#ifndef TDF_API
#  define TDF_API TDF_DLL_EXPORT
#endif

#if defined(__clang__) || defined(__GNUC__)
#  define TDF_CPP_STANDARD __cplusplus
#elif defined(_MSC_VER)
#  define TDF_CPP_STANDARD _MSVC_LANG
#endif

#if CPP_STANDARD >= 199711L
#  define TDF_HAS_CPP_03 1
#endif
#if CPP_STANDARD >= 201103L
#  define TDF_HAS_CPP_11 1
#endif
#if CPP_STANDARD >= 201402L
#  define TDF_HAS_CPP_14 1
#endif
#if CPP_STANDARD >= 201703L
#  define TDF_HAS_CPP_17 1
#endif

#if defined(__clang__)
#  define TDF_COMPILER_CLANG
#elif defined(__GNUC__)
#  define TDF_COMPILER_GCC
#elif defined(_MSC_VER)
#  define TDF_COMPILER_MSVC
#else
#  error "Unknow compiler"
#endif

#define TDF_BASE_EMBEDDER_ONLY

#define TDF_BASE_DISALLOW_COPY(TypeName) TypeName(const TypeName&) = delete

#define TDF_BASE_DISALLOW_ASSIGN(TypeName) TypeName& operator=(const TypeName&) = delete

#define TDF_BASE_DISALLOW_MOVE(TypeName) \
  TypeName(TypeName&&) = delete;         \
  TypeName& operator=(TypeName&&) = delete

#define TDF_BASE_DISALLOW_COPY_AND_ASSIGN(TypeName) \
  TypeName(const TypeName&) = delete;               \
  TypeName& operator=(const TypeName&) = delete

#define TDF_BASE_DISALLOW_COPY_ASSIGN_AND_MOVE(TypeName) \
  TypeName(const TypeName&) = delete;                    \
  TypeName(TypeName&&) = delete;                         \
  TypeName& operator=(const TypeName&) = delete;         \
  TypeName& operator=(TypeName&&) = delete

#define TDF_BASE_DISALLOW_IMPLICIT_CONSTRUCTORS(TypeName) \
  TypeName() = delete;                                    \
  TDF_BASE_DISALLOW_COPY_ASSIGN_AND_MOVE(TypeName)

#ifdef NDEBUG
#  define assert_fn(fn) ((void)0)
#else
#  define assert_fn(fn) \
    do {                \
      auto b = fn();    \
      assert(b);        \
    } while (0)
#endif

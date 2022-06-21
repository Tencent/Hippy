// Copyright (c) 2020 Tencent Corporation. All rights reserved.

#pragma once

#define FOOTSTONE_EMBEDDER_ONLY

#define FOOTSTONE_DISALLOW_COPY(TypeName) TypeName(const TypeName&) = delete

#define FOOTSTONE_DISALLOW_ASSIGN(TypeName) TypeName& operator=(const TypeName&) = delete

#define FOOTSTONE_DISALLOW_MOVE(TypeName) \
  TypeName(TypeName&&) = delete;         \
  TypeName& operator=(TypeName&&) = delete

#define FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(TypeName) \
  TypeName(const TypeName&) = delete;               \
  TypeName& operator=(const TypeName&) = delete

#define FOOTSTONE_DISALLOW_COPY_ASSIGN_AND_MOVE(TypeName) \
  TypeName(const TypeName&) = delete;                    \
  TypeName(TypeName&&) = delete;                         \
  TypeName& operator=(const TypeName&) = delete;         \
  TypeName& operator=(TypeName&&) = delete

#define FOOTSTONE_DISALLOW_IMPLICIT_CONSTRUCTORS(TypeName) \
  TypeName() = delete;                                    \
  FOOTSTONE_DISALLOW_COPY_ASSIGN_AND_MOVE(TypeName)

#ifdef NDEBUG
#define assert_fn(fn) ((void)0)
#else
#define assert_fn(fn) \
  do {                \
    auto b = fn();    \
    assert(b);        \
  } while (0)
#endif

#define RETURN_IF(x) \
  if (x) {           \
    return;          \
  }


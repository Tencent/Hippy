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

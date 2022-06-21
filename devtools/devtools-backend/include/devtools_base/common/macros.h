/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#include "devtools_base/logging.h"

#define DEVTOOLS_WEAK_THIS weak_this = weak_from_this()
#define DEVTOOLS_SHARED_THIS self = this->shared_from_this()
#define DEVTOOLS_HAS_SELF(type) auto self = std::static_pointer_cast<type>(weak_this.lock())
#define DEVTOOLS_DEFINE_SELF(type) DEVTOOLS_HAS_SELF(type);
#define DEVTOOLS_DEFINE_AND_CHECK_SELF(type) \
  DEVTOOLS_DEFINE_SELF(type)                 \
  if (!self) {                      \
    return;                         \
  }

#define FOOTSTONE_DISALLOW_COPY_AND_ASSIGN(TypeName) \
  TypeName(const TypeName&) = delete;               \
  TypeName& operator=(const TypeName&) = delete

#define DEVTOOLS_BASE_UNREACHABLE() \
  do {                        \
    BACKEND_LOGE(TDF_BACKEND, "devtools unreachable abort");   \
    abort();                  \
  } while (0)

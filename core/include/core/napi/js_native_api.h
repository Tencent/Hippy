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

#ifndef HIPPY_CORE_NAPI_JS_NATIVE_API_H_
#define HIPPY_CORE_NAPI_JS_NATIVE_API_H_

#include <stdbool.h>
#include <stddef.h>

#include <string>

#include "core/napi/js_native_api_types.h"

namespace hippy {
namespace napi {

std::shared_ptr<CtxValue> GetInternalBindingFn(std::shared_ptr<Scope> scope);

std::shared_ptr<VM> CreateVM();

void DetachThread();
// Create Value

}  // namespace napi
}  // namespace hippy

#endif  // HIPPY_CORE_NAPI_JS_NATIVE_API_H_

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

#pragma once

#include "driver/base/js_value_wrapper.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "footstone/hippy_value.h"
#include "dom/dom_argument.h"

namespace hippy {
inline namespace driver {
inline namespace base {

std::shared_ptr<footstone::HippyValue> ToDomValue(const std::shared_ptr<hippy::Ctx>& ctx,
                                                  const std::shared_ptr<hippy::CtxValue>& value);
std::shared_ptr<hippy::DomArgument> ToDomArgument(const std::shared_ptr<hippy::Ctx>& ctx,
                                                  const std::shared_ptr<CtxValue>& value);
std::shared_ptr<hippy::CtxValue> CreateCtxValue(const std::shared_ptr<hippy::Ctx>& ctx,
                                                const std::shared_ptr<footstone::HippyValue>& value);

}
}
}


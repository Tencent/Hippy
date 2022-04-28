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

namespace hippy::devtools {

typedef int ErrorType;

constexpr const ErrorType kErrorNotSupport = -1;  // 当前框架不支持，如 delegate 未注入
constexpr const ErrorType kErrorParams = -2;  // 参数异常
constexpr const ErrorType kErrorFailCode = -3;  // 结果异常
constexpr const ErrorType kErrorImpl = -4;  // 实现异常，如第三方框架实现适配器异常

}  // namespace hippy::devtools

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

constexpr const ErrorType kErrorNotSupport = -1;  // the current framework does not support such as delegate injection
constexpr const ErrorType kErrorParams = -2;      // parameters of the abnormal
constexpr const ErrorType kErrorFailCode = -3;    // abnormal results
constexpr const ErrorType kErrorImpl =
    -4;  // implementation exceptions, such as an adapter exception implemented by a third-party framework

}  // namespace hippy::devtools

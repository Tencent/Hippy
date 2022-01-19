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

#if defined(_WIN32)
#  define EXTERN_C extern "C" __declspec(dllexport)
#  define EXPORT __declspec(dllexport)
#else
#  define EXTERN_C extern "C" __attribute__((visibility("default"))) __attribute__((used))
#  define EXPORT __attribute__((visibility("default")))
#endif

#ifdef __APPLE__
#  include <functional>
#  include <memory>
#  include <utility>
#endif

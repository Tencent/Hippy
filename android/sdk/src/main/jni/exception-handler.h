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

#ifndef EXCEPTION_HANDLER_H_
#define EXCEPTION_HANDLER_H_

#include <iostream>
#include <sstream>

#include "runtime.h"  // NOLINT(build/include_subdir)

class JNIEnvironment;

class ExceptionHandler {
 public:
  ExceptionHandler() = default;
  ~ExceptionHandler() = default;

 public:
  static void ReportJsException(std::shared_ptr<V8Runtime> runtime,
                                std::stringstream& description_stream,
                                std::stringstream& stack_stream);

  void JSONException(std::shared_ptr<V8Runtime> runtime, const char* jsonValue);
};

#endif  // EXCEPTION_HANDLER_H_

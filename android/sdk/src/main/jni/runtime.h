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

#ifndef RUNTIME_H_
#define RUNTIME_H_

#include <jni.h>

#include "core/engine.h"
#include "core/napi/js-native-api.h"
#include "core/scope.h"
#include "inspector/v8-inspector-client-impl.h"
#include "scoped-java-ref.h"

typedef struct V8Runtime_ {
  bool bridge_param_json_;
  bool is_dev_module_ = false;
  int64_t group_id_;
  std::shared_ptr<JavaRef> bridge_;
  std::shared_ptr<Engine> engine_;
  std::shared_ptr<Scope> scope_;
  std::shared_ptr<hippy::napi::CtxValue> bridge_func_;
} V8Runtime;

#endif  // RUNTIME_H_

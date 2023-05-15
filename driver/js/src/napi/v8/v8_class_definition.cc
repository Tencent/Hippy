/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

#include "driver/napi/v8/v8_class_definition.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

V8ClassDefinition::V8ClassDefinition(v8::Isolate* isolate, v8::Local<v8::FunctionTemplate> tpl) {
  template_.Reset(isolate, tpl);
}

V8ClassDefinition::~V8ClassDefinition() {
  template_.Reset();
}

}
}
}

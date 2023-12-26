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

#include "driver/napi/jsh/jsh_class_definition.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

JSHClassDefinition::JSHClassDefinition(JSVM_Env env, JSVM_Value value): env_(env) {
  auto stauts = OH_JSVM_CreateReference(env, value, 1, &value_ref_);
  FOOTSTONE_CHECK(stauts == JSVM_OK);
}

JSHClassDefinition::~JSHClassDefinition() {
  auto stauts = OH_JSVM_DeleteReference(env_, value_ref_);
  FOOTSTONE_CHECK(stauts == JSVM_OK);
}

}
}
}

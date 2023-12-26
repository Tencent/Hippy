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

#include "driver/napi/js_ctx_value.h"
#include "footstone/logging.h"
#include <ark_runtime/jsvm.h>

namespace hippy {
inline namespace driver {
inline namespace napi {

struct JSHCtxValue : public CtxValue {
  JSHCtxValue(JSVM_Env env, JSVM_Value value)
      : env_(env) {
    if (value) {
      auto status = OH_JSVM_CreateReference(env, value, 1, &value_ref_);
      FOOTSTONE_DCHECK(status == JSVM_OK);
    }
  }
  ~JSHCtxValue() {
    if (value_ref_) {
      auto status = OH_JSVM_DeleteReference(env_, value_ref_);
      FOOTSTONE_DCHECK(status == JSVM_OK);
    }
  }
  JSHCtxValue(const JSHCtxValue&) = delete;
  JSHCtxValue& operator=(const JSHCtxValue&) = delete;
  
  JSVM_Value GetValue() {
    if (!value_ref_) {
      return nullptr;
    }
    JSVM_Value result = nullptr;
    auto staus = OH_JSVM_GetReferenceValue(env_, value_ref_, &result);
    FOOTSTONE_CHECK(staus == JSVM_OK);
    return result;
  }

  JSVM_Env env_ = nullptr;
  JSVM_Ref value_ref_ = nullptr;
};

}
}
}

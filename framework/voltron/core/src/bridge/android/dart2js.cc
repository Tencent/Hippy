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

#include "dart2js.h"
#include "data_holder.h"

namespace voltron {
namespace bridge {

using CALLFUNCTION_CB_STATE = hippy::driver::CALL_FUNCTION_CB_STATE;
using JsDriverUtils = hippy::driver::JsDriverUtils;

void CallJSFunction(int64_t scope_id, const string_view& action_name, bytes params_data,
                    const std::function<void(int64_t)>& callback) {
  auto scope = std::any_cast<std::shared_ptr<hippy::Scope>>(voltron::FindObject(footstone::checked_numeric_cast<
      int64_t,
      uint32_t>(scope_id)));
  FOOTSTONE_CHECK(scope);
  JsDriverUtils::CallJs(action_name, scope,
                        [callback](CALLFUNCTION_CB_STATE state, const string_view& msg) {
                          callback(static_cast<int64_t>(state));
                        }, std::move(params_data),
                        []() {});
}

}  // namespace bridge
}  // namespace voltron

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

namespace voltron {
namespace bridge {

void CallJSFunction(int64_t runtime_id, const string_view& action_name, bytes params_data,
                    std::function<void(int64_t)> callback) {
  FOOTSTONE_DCHECK(runtime_id <= std::numeric_limits<std::int32_t>::max()
                      && runtime_id >= std::numeric_limits<std::int32_t>::min());
  V8BridgeUtils::CallJs(action_name, static_cast<int32_t>(runtime_id),
                        [callback](CALLFUNCTION_CB_STATE state, const string_view& msg) {
                          callback(static_cast<int64_t>(state));
                        }, std::move(params_data),
                        []() {});
}

}  // namespace bridge
}  // namespace voltron

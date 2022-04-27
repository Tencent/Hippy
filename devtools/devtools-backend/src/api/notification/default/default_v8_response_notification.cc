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

#include "api/notification/default/default_v8_response_notification.h"
#include <string>

namespace hippy {
namespace devtools {
DefaultV8ResponseAdapter::DefaultV8ResponseAdapter(ResponseHandler response_handler)
    : response_handler_(response_handler) {}
/**
 * 消息送v8返回
 * @param data
 */
void DefaultV8ResponseAdapter::ResponseToDevtool(std::string data) {
  if (response_handler_) {
    response_handler_(data);
  }
}

}  // namespace devtools
}  // namespace hippy

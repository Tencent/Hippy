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

#include "core/runtime/v8/inspector/v8_channel_impl.h"

#include <string>
#include <sstream>

#include "devtools/devtools_helper.h"
#include "core/base/string_view_utils.h"
#include "base/unicode_string_view.h"

namespace hippy::inspector {

V8ChannelImpl::V8ChannelImpl(std::shared_ptr<Bridge> bridge)
    : bridge_(std::move(bridge)) {}

void sendResponseToDevTools(v8_inspector::StringView stringView) {
  if (stringView.is8Bit()) {
    return;
  }
  auto data_chars = reinterpret_cast<const char16_t*>(stringView.characters16());
  auto result = base::StringViewUtils::ToU8StdStr(tdf::base::unicode_string_view(data_chars, stringView.length()));
  DEVTOOLS_JS_REGISTER_RECEIVE_VM_RESPONSE(result);
}

void V8ChannelImpl::sendResponse(
    int callId,
    std::unique_ptr<v8_inspector::StringBuffer> message) {
#if TDF_SERVICE_ENABLED
  sendResponseToDevTools(message->string());
#else
  bridge_->SendResponse(std::move(message));
#endif
}

void V8ChannelImpl::sendNotification(
    std::unique_ptr<v8_inspector::StringBuffer> message) {
#if TDF_SERVICE_ENABLED
  sendResponseToDevTools(message->string());
#else
  bridge_->SendNotification(std::move(message));
#endif
}

}  // namespace hippy

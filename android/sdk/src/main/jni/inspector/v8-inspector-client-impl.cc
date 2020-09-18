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

#include "inspector/v8-inspector-client-impl.h"

#include "core/napi/v8/js-native-api-v8.h"

V8InspectorClientImpl::V8InspectorClientImpl(std::shared_ptr<Scope> scope)
    : scope_(scope) {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  inspector_ = v8_inspector::V8Inspector::create(isolate, this);
}

void V8InspectorClientImpl::Reset(std::shared_ptr<Scope> scope,
                                  std::shared_ptr<JavaRef> bridge) {
  scope_ = scope;
  channel_->SetBridge(bridge);
}

void V8InspectorClientImpl::Connect(std::shared_ptr<JavaRef> bridge) {
  channel_ = std::make_unique<V8ChannelImpl>(bridge);
  session_ = inspector_->connect(1, channel_.get(), v8_inspector::StringView());
}

void V8InspectorClientImpl::CreateContext() {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  uint8_t name_uint8[] = "Hippy";
  inspector_->contextCreated(v8_inspector::V8ContextInfo(
      context, 1, v8_inspector::StringView(name_uint8, arraysize(name_uint8))));
}

void V8InspectorClientImpl::SendMessageToV8(
    std::shared_ptr<std::vector<uint8_t>> params) {
  if (channel_) {
    std::string str(params->begin(), params->end());
    if (!str.compare("chrome_socket_closed")) {
      session_ =
          inspector_->connect(1, channel_.get(), v8_inspector::StringView());
    } else {
      v8_inspector::StringView message_view(params->data(), params->size());
      session_->dispatchProtocolMessage(message_view);
    }
  }
}

void V8InspectorClientImpl::DestroyContext() {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  inspector_->contextDestroyed(context);
}

void V8InspectorClientImpl::runMessageLoopOnPause(int contextGroupId) {
  scope_->GetTaskRunner()->PauseThreadForInspector();
}

void V8InspectorClientImpl::quitMessageLoopOnPause() {
  scope_->GetTaskRunner()->ResumeThreadForInspector();
}

void V8InspectorClientImpl::runIfWaitingForDebugger(int contextGroupId) {
  scope_->GetTaskRunner()->ResumeThreadForInspector();
}

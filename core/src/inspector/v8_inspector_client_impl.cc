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

#include "core/inspector/v8_inspector_client_impl.h"

#include "core/core.h"

namespace hippy {
namespace inspector {

constexpr uint8_t kProjectName[] = "Hippy";

void V8InspectorClientImpl::CreateInspector(const std::shared_ptr<Scope>& scope) {
  if (inspector_) {
    return;
  }
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  inspector_ = v8_inspector::V8Inspector::create(isolate, this);
}

std::shared_ptr<V8InspectorContext> V8InspectorClientImpl::CreateInspectorContext(const std::shared_ptr<Scope>& scope, const std::shared_ptr<Bridge>& bridge) {
  auto inspector_context = reload_inspector_context_;
  if (inspector_context) {
    TDF_BASE_DLOG(INFO) << "reload need inspector reuse context, session and change bridge";
    inspector_context->SetBridge(bridge);
  } else {
    auto context_group_id = context_group_count_.fetch_add(1, std::memory_order_relaxed);
    auto channel = std::make_unique<V8ChannelImpl>(bridge);
    auto session = inspector_->connect(context_group_id, channel.get(), v8_inspector::StringView());
    inspector_context = std::make_shared<V8InspectorContext>(context_group_id, std::move(channel), std::move(session));
    std::lock_guard<std::mutex> lock(inspector_context_mutex_);
    inspector_context_map_[context_group_id] = inspector_context;
  }
  inspector_context->SetScope(scope);
  // enter v8 context
  CreateContext(inspector_context);
  return inspector_context;
}

void V8InspectorClientImpl::DestroyInspectorContext(bool is_reload, const std::shared_ptr<V8InspectorContext> &inspector_context) {
  // exit v8 context
  DestroyContext(inspector_context);
  // preserve inspector_context for reload reuse
  reload_inspector_context_ = is_reload ? inspector_context: nullptr;
  if (!is_reload) {
    std::lock_guard<std::mutex> lock(inspector_context_mutex_);
    inspector_context_map_.erase(inspector_context->GetContextGroupId());
  }
  inspector_context->SetScope(nullptr);
}

void V8InspectorClientImpl::CreateContext(const std::shared_ptr<V8InspectorContext>& inspector_context) {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(inspector_context->GetScope()->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  inspector_->contextCreated(v8_inspector::V8ContextInfo(
      context, inspector_context->GetContextGroupId(), v8_inspector::StringView(kProjectName, arraysize(kProjectName))));
}

void V8InspectorClientImpl::SendMessageToV8(const std::shared_ptr<V8InspectorContext>& inspector_context, const unicode_string_view& params) {
  if (inspector_context) {
    unicode_string_view::Encoding encoding = params.encoding();
    v8_inspector::StringView message_view;
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        const std::string& str = params.latin1_value();
        if (str == "chrome_socket_closed") {
          auto session = inspector_->connect(inspector_context->GetContextGroupId(), inspector_context->GetV8Channel(),
                                         v8_inspector::StringView());
          inspector_context->SetSession(std::move(session));
          return;
        }
        message_view = v8_inspector::StringView(
            reinterpret_cast<const uint8_t*>(str.c_str()), str.length());
        break;
      }
      case unicode_string_view::Encoding::Utf16: {
        const std::u16string& str = params.utf16_value();
        if (str == u"chrome_socket_closed") {
          auto session = inspector_->connect(inspector_context->GetContextGroupId(), inspector_context->GetV8Channel(),
                                         v8_inspector::StringView());
          inspector_context->SetSession(std::move(session));
          return;
        }
        message_view = v8_inspector::StringView(
            reinterpret_cast<const uint16_t*>(str.c_str()), str.length());
        break;
      }
      default:
        TDF_BASE_DLOG(INFO) << "encoding = " << static_cast<int>(encoding);
        TDF_BASE_UNREACHABLE();
    }
    inspector_context->SendMessageToV8(message_view);
  }
}

void V8InspectorClientImpl::DestroyContext(const std::shared_ptr<V8InspectorContext>& inspector_context) {
  TDF_BASE_DLOG(INFO) << "V8InspectorClientImpl DestroyContext";
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(inspector_context->GetScope()->GetContext());
  if (!ctx) {
    TDF_BASE_DLOG(ERROR) << "V8InspectorClientImpl ctx error";
    return;
  }
  quitMessageLoopOnPause();

  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  TDF_BASE_DLOG(INFO) << "inspector contextDestroyed begin";
  inspector_->contextDestroyed(context);
  TDF_BASE_DLOG(INFO) << "inspector contextDestroyed end";
}

v8::Local<v8::Context> V8InspectorClientImpl::ensureDefaultContextInGroup(
    __unused int contextGroupId) {
  std::lock_guard<std::mutex> lock(inspector_context_mutex_);
  auto inspector_context_entry = inspector_context_map_.find(contextGroupId);
  if (inspector_context_entry == inspector_context_map_.end()) {
    TDF_BASE_DLOG(INFO) << "ensureDefaultContextInGroup = " << contextGroupId;
    TDF_BASE_UNREACHABLE();
  }

  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(inspector_context_entry->second->GetScope()->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  return context;
}

void V8InspectorClientImpl::runMessageLoopOnPause(int contextGroupId) {
  auto js_runner = js_runner_.lock();
  if (js_runner) {
    js_runner->PauseThreadForInspector();
  }
}

void V8InspectorClientImpl::quitMessageLoopOnPause() {
  auto js_runner = js_runner_.lock();
  if (js_runner) {
    js_runner->ResumeThreadForInspector();
  }
}

void V8InspectorClientImpl::runIfWaitingForDebugger(__unused int contextGroupId) {
  auto js_runner = js_runner_.lock();
  if (js_runner) {
    js_runner->ResumeThreadForInspector();
  }
}

}  // namespace inspector
}  // namespace hippy

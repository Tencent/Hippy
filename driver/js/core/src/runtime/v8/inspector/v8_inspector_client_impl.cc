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
 *     http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/runtime/v8/inspector/v8_inspector_client_impl.h"

#include <utility>

#include "core/runtime/v8/bridge.h"

namespace hippy::inspector {

constexpr uint8_t kProjectName[] = "Hippy";

V8InspectorClientImpl::V8InspectorClientImpl(std::shared_ptr<Scope> scope, std::weak_ptr<TaskRunner> runner)
    : scope_(std::move(scope)), js_runner_(std::move(runner)) {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  inspector_ = v8_inspector::V8Inspector::create(isolate, this);
  interrupt_queue_ = std::make_shared<InterruptQueue>(isolate);
  auto& map = InterruptQueue::GetPersistentMap();
  map.Insert(interrupt_queue_->GetId(), interrupt_queue_);
}

V8InspectorClientImpl::~V8InspectorClientImpl() {
  auto& map = InterruptQueue::GetPersistentMap();
  map.Erase(interrupt_queue_->GetId());
}

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
void V8InspectorClientImpl::Reset(std::shared_ptr<Scope> scope,
                                  const std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
  scope_ = std::move(scope);
  channel_->SetDevtoolsDataSource(devtools_data_source);
}

void V8InspectorClientImpl::Connect(const std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
  channel_ = std::make_unique<V8ChannelImpl>();
  session_ = inspector_->connect(1, channel_.get(), v8_inspector::StringView());
  channel_->SetDevtoolsDataSource(devtools_data_source);
}
#endif

void V8InspectorClientImpl::CreateContext() {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  inspector_->contextCreated(v8_inspector::V8ContextInfo(
      context, 1, v8_inspector::StringView(kProjectName, arraysize(kProjectName))));
}

void V8InspectorClientImpl::SendMessageToV8(unicode_string_view&& params) {
  std::shared_ptr<TaskRunner> msg_runner;
  {
    std::unique_lock<std::mutex> lock(mutex_);
    if (inspector_runner_) {
      msg_runner = inspector_runner_;
    } else {
      msg_runner = js_runner_.lock();
    }
    if (!msg_runner) {
      FOOTSTONE_LOG(ERROR) << "msg runner error";
      return;
    }
    interrupt_queue_->SetTaskRunner(msg_runner);
  }

  auto weak_self = weak_from_this();
  auto msg_unit = [params, weak_self] {
    auto self = weak_self.lock();
    if (!self) {
      return;
    }
    const auto& channel = self->GetChannel();
    if (!channel) {
      return;
    }
    const auto& inspector = self->GetInspector();
    unicode_string_view::Encoding encoding = params.encoding();
    v8_inspector::StringView message_view;
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        std::string str = params.latin1_value();
        if (!str.compare("chrome_socket_closed")) {
          auto session = inspector->connect(1, channel.get(), v8_inspector::StringView());
          self->SetSession(std::move(session));
          return;
        }
        message_view = v8_inspector::StringView(
            reinterpret_cast<const uint8_t*>(str.c_str()), str.length());
        break;
      }
      case unicode_string_view::Encoding::Utf16: {
        std::u16string str = params.utf16_value();
        if (!str.compare(u"chrome_socket_closed")) {
          auto session = inspector->connect(1, channel.get(), v8_inspector::StringView());
          self->SetSession(std::move(session));
          return;
        }
        message_view = v8_inspector::StringView(
            reinterpret_cast<const uint16_t*>(str.c_str()), str.length());
        break;
      }
      default:
        FOOTSTONE_DLOG(INFO) << "encoding = " << static_cast<int>(encoding);
        FOOTSTONE_UNREACHABLE();
    }
    const auto& session = self->GetSession();
    if (!session) {
      return;
    }
    session->dispatchProtocolMessage(message_view);
  };
  interrupt_queue_->PostTask(std::move(msg_unit));
}

void V8InspectorClientImpl::DestroyContext() {
  FOOTSTONE_DLOG(INFO) << "V8InspectorClientImpl DestroyContext";
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  if (!ctx) {
    FOOTSTONE_DLOG(ERROR) << "V8InspectorClientImpl ctx error";
    return;
  }
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  FOOTSTONE_DLOG(INFO) << "inspector contextDestroyed begin";
  inspector_->contextDestroyed(context);
  FOOTSTONE_DLOG(INFO) << "inspector contextDestroyed end";
}

v8::Local<v8::Context> V8InspectorClientImpl::ensureDefaultContextInGroup(
    int contextGroupId) {
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(scope_->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, ctx->context_persistent_);
  v8::Context::Scope context_scope(context);
  return context;
}

void V8InspectorClientImpl::runMessageLoopOnPause(int contextGroupId) {
  FOOTSTONE_DLOG(INFO) << "runMessageLoopOnPause, contextGroupId = " << contextGroupId;
  std::shared_ptr<TaskRunner> runner = js_runner_.lock();
  if (runner) {
    inspector_runner_ = std::make_shared<TaskRunner>();
    runner->AddSubTaskRunner(inspector_runner_, true);
  }
}

void V8InspectorClientImpl::quitMessageLoopOnPause() {
  FOOTSTONE_DLOG(INFO) << "quitMessageLoopOnPause";
  std::shared_ptr<TaskRunner> runner = js_runner_.lock();
  if (runner) {
    runner->RemoveSubTaskRunner(inspector_runner_);
    inspector_runner_ = nullptr;
  }

}

void V8InspectorClientImpl::runIfWaitingForDebugger(int contextGroupId) {
  FOOTSTONE_DLOG(INFO) << "runIfWaitingForDebugger, contextGroupId = " << contextGroupId;
  quitMessageLoopOnPause();
}

}  // namespace hippy

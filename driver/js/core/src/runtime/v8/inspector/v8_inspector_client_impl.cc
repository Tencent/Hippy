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
#include "core/napi/v8/js_native_api_v8.h"

namespace hippy::inspector {

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
  interrupt_queue_ = std::make_shared<InterruptQueue>(isolate);
  auto& map = InterruptQueue::GetPersistentMap();
  map.Insert(interrupt_queue_->GetId(), interrupt_queue_);
}

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
std::shared_ptr<V8InspectorContext> V8InspectorClientImpl::CreateInspectorContext(const std::shared_ptr<Scope> scope,
                                                   std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
  auto inspector_context = reload_inspector_context_;
  if (inspector_context) {
    FOOTSTONE_DLOG(INFO) << "reload need inspector reuse context, session and change bridge";
    inspector_context->SetDevtoolsDataSource(std::move(devtools_data_source));
  } else {
    auto context_group_id = context_group_count_.fetch_add(1, std::memory_order_relaxed);
    auto channel = std::make_unique<V8ChannelImpl>();
    channel->SetDevtoolsDataSource(devtools_data_source);
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

void V8InspectorClientImpl::DestroyInspectorContext(bool is_reload,
                                                    const std::shared_ptr<
                                                        V8InspectorContext> &inspector_context) {
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
#endif

V8InspectorClientImpl::~V8InspectorClientImpl() {
  auto& map = InterruptQueue::GetPersistentMap();
  map.Erase(interrupt_queue_->GetId());
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

void V8InspectorClientImpl::SendMessageToV8(const std::shared_ptr<V8InspectorContext>& inspector_context_ref, unicode_string_view&& params) {
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

  std::weak_ptr<V8InspectorContext> weak_inspector_context = inspector_context_ref;
  auto weak_self = weak_from_this();
  auto msg_unit = [weak_inspector_context, params, weak_self] {
    auto self = weak_self.lock();
    if (!self) {
      return;
    }
    auto inspector_context = weak_inspector_context.lock();
    if (!inspector_context) {
      return;
    }
    const auto& inspector = self->GetInspector();
    unicode_string_view::Encoding encoding = params.encoding();
    v8_inspector::StringView message_view;
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        std::string str = params.latin1_value();
        if (!str.compare("chrome_socket_closed")) {
          auto session = inspector->connect(inspector_context->GetContextGroupId(), inspector_context->GetV8Channel(), v8_inspector::StringView());
          inspector_context->SetSession(std::move(session));
          return;
        }
        message_view = v8_inspector::StringView(
            reinterpret_cast<const uint8_t*>(str.c_str()), str.length());
        break;
      }
      case unicode_string_view::Encoding::Utf16: {
        std::u16string str = params.utf16_value();
        if (!str.compare(u"chrome_socket_closed")) {
          auto session = inspector->connect(inspector_context->GetContextGroupId(), inspector_context->GetV8Channel(), v8_inspector::StringView());
          inspector_context->SetSession(std::move(session));
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
    inspector_context->SendMessageToV8(message_view);
  };
  interrupt_queue_->PostTask(std::move(msg_unit));
}

void V8InspectorClientImpl::DestroyContext(const std::shared_ptr<V8InspectorContext>& inspector_context) {
  FOOTSTONE_DLOG(INFO) << "V8InspectorClientImpl DestroyContext";
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(inspector_context->GetScope()->GetContext());
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
  std::lock_guard<std::mutex> lock(inspector_context_mutex_);
  auto inspector_context_entry = inspector_context_map_.find(contextGroupId);
  if (inspector_context_entry == inspector_context_map_.end()) {
    FOOTSTONE_DLOG(INFO) << "ensureDefaultContextInGroup = " << contextGroupId;
    FOOTSTONE_UNREACHABLE();
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

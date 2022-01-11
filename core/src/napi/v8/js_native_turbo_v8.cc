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

#include "core/napi/v8/js_native_turbo_v8.h"

#include <core/base/string_view_utils.h>
#include <jni/java_turbo_module.h>

#include "hippy.h"

using unicode_string_view = tdf::base::unicode_string_view;

namespace hippy {
namespace napi {

V8TurboEnv::V8TurboEnv(const std::shared_ptr<Ctx> &context)
    : TurboEnv(context) {
  TDF_BASE_DLOG(INFO) << "V8TurboEnv()";
  CreateHostObjectConstructor();
}

V8TurboEnv::~V8TurboEnv() {
  TDF_BASE_DLOG(INFO) << "~V8TurboEnv()";
  if (!host_object_constructor_.IsEmpty()) {
    host_object_constructor_.Reset();
  }
  for (const auto &host_object_tracker : host_object_tracker_list_) {
    if (!host_object_tracker)
      continue;
    host_object_tracker->ResetHostObject();
  }
}

void V8TurboEnv::AddHostObjectTracker(
    const std::shared_ptr<HostObjectTracker> &host_object_tracker) {
  host_object_tracker_list_.push_back(host_object_tracker);
  TDF_BASE_DLOG(INFO) << "AddHostObjectTracker %d",
      host_object_tracker_list_.size();
}

void V8TurboEnv::CreateHostObjectConstructor() {
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(context_);
  v8::Isolate *isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  // Create and keep the constructor for creating Host objects.
  v8::Local<v8::FunctionTemplate> constructor_for_host_object_template =
      v8::FunctionTemplate::New(isolate);
  v8::Local<v8::ObjectTemplate> host_object_template =
      constructor_for_host_object_template->InstanceTemplate();
  host_object_template->SetHandler(v8::NamedPropertyHandlerConfiguration(
      HostObjectProxy::Get, nullptr, nullptr, nullptr, nullptr));

  host_object_template->SetInternalFieldCount(1);
  host_object_constructor_.Reset(
      isolate, constructor_for_host_object_template->GetFunction(context)
                   .ToLocalChecked());
}

std::shared_ptr<CtxValue> V8TurboEnv::CreateObject(
    const std::shared_ptr<HostObject> &host_object) {
  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(context_);
  v8::Isolate *isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  auto *host_object_proxy = new HostObjectProxy(*this, host_object);

  v8::Local<v8::Object> new_object;
  if (!host_object_constructor_.Get(isolate)
           ->NewInstance(context)
           .ToLocal(&new_object)) {
    ConvertUtils::ThrowException(context_, "CreateObject Fail.");
    return context_->CreateUndefined();
  }

  new_object->SetInternalField(
      0, v8::Local<v8::External>::New(
             isolate, v8::External::New(isolate, host_object_proxy)));
  AddHostObjectTracker(std::make_shared<HostObjectTracker>(*this, new_object,
                                                           host_object_proxy));
  return std::make_shared<V8CtxValue>(isolate, new_object);
}

std::shared_ptr<napi::CtxValue> V8TurboEnv::CreateFunction(
    const std::shared_ptr<napi::CtxValue> &name,
    int param_count,
    HostFunctionType func) {
  TDF_BASE_DLOG(INFO) << "enter createFunction";

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(context_);
  v8::Isolate *isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  auto *host_function_proxy = new HostFunctionProxy(*this, func);

  v8::Local<v8::Function> new_function;
  if (!v8::Function::New(
           isolate->GetCurrentContext(),
           HostFunctionProxy::HostFunctionCallback,
           v8::Local<v8::External>::New(
               isolate, v8::External::New(isolate, host_function_proxy)),
           param_count)
           .ToLocal(&new_function)) {
    ConvertUtils::ThrowException(context_, "CreateFunction Fail.");
    return context_->CreateUndefined();
  }

  unicode_string_view str_view;
  if (!context_->GetValueString(name, &str_view)) {
    return context_->CreateUndefined();
  }

  new_function->SetName(v8_ctx->CreateV8String(str_view));
  AddHostObjectTracker(std::make_shared<HostObjectTracker>(
      *this, new_function, host_function_proxy));
  return std::make_shared<V8CtxValue>(isolate, new_function);
}

std::shared_ptr<HostObject> V8TurboEnv::GetHostObject(
    std::shared_ptr<CtxValue> value) {
  std::shared_ptr<V8Ctx> v8Ctx = std::static_pointer_cast<V8Ctx>(context_);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value> &persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(v8Ctx->isolate_, persistent_value);
  v8::Local<v8::Context> context =
      v8Ctx->context_persistent_.Get(v8Ctx->isolate_);
  v8::Local<v8::Object> obj = handle_value->ToObject(context).ToLocalChecked();
  v8::Local<v8::Value> field = obj->GetInternalField(0);
  if (field.IsEmpty()) {
    return nullptr;
  }

  v8::Local<v8::External> internal_field = v8::Local<v8::External>::Cast(field);
  if (!internal_field->Value()) {
    return nullptr;
  }

  auto *proxy = reinterpret_cast<HostObjectProxy *>(internal_field->Value());

  for (const std::shared_ptr<HostObjectTracker> &tracker :
       host_object_tracker_list_) {
    if (tracker && tracker->equals(proxy)) {
      return proxy->getHostObject();
    }
  }
  return nullptr;
}
}  // namespace napi
}  // namespace hippy

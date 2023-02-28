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

#include "core/vm/v8/memory_module.h"

#include <string>

#include "base/logging.h"
#include "core/napi/v8/v8_ctx.h"
#include "core/scope.h"

using unicode_string_view = tdf::base::unicode_string_view;
using Ctx = hippy::napi::Ctx;
using V8Ctx = hippy::napi::V8Ctx;
using CtxValue = hippy::napi::CtxValue;

GEN_INVOKE_CB(MemoryModule, Get) // NOLINT(cert-err58-cpp)

constexpr char kJsHeapSizeLimit[] = "jsHeapSizeLimit";
constexpr char kTotalJSHeapSize[] = "totalJSHeapSize";
constexpr char kUsedJSHeapSize[] = "usedJSHeapSize";
constexpr char kJsNumberOfNativeContexts[] = "jsNumberOfNativeContexts";
constexpr char kJsNumberOfDetachedContexts[] = "jsNumberOfDetachedContexts";

void MemoryModule::Get(const hippy::napi::CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto ctx = std::static_pointer_cast<V8Ctx>(scope->GetContext());
  v8::Isolate *isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  auto heap_statistics = std::make_shared<v8::HeapStatistics>();
  isolate->GetHeapStatistics(heap_statistics.get());

  auto jsHeapSizeLimitValue =
      ctx->CreateNumber(static_cast<double>(heap_statistics->heap_size_limit()));
  auto totalJSHeapSizeValue =
      ctx->CreateNumber(static_cast<double>(heap_statistics->total_heap_size()));
  auto usedJSHeapSizeValue =
      ctx->CreateNumber(static_cast<double>(heap_statistics->used_heap_size()));
  auto jsNumberOfNativeContextsValue =
      ctx->CreateNumber(static_cast<double>(heap_statistics->number_of_native_contexts()));
  auto jsNumberOfDetachedContextsValue =
      ctx->CreateNumber(static_cast<double>(heap_statistics->number_of_detached_contexts()));

  auto jsHeapSizeLimit = ctx->CreateString(kJsHeapSizeLimit);
  auto totalJSHeapSize = ctx->CreateString(kTotalJSHeapSize);
  auto usedJSHeapSize = ctx->CreateString(kUsedJSHeapSize);
  auto jsNumberOfNativeContexts = ctx->CreateString(kJsNumberOfNativeContexts);
  auto jsNumberOfDetachedContexts = ctx->CreateString(kJsNumberOfDetachedContexts);

  const std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> map(
      {
          {jsHeapSizeLimit, jsHeapSizeLimitValue},
          {totalJSHeapSize, totalJSHeapSizeValue},
          {usedJSHeapSize, usedJSHeapSizeValue},
          {jsNumberOfNativeContexts, jsNumberOfNativeContextsValue},
          {jsNumberOfDetachedContexts, jsNumberOfDetachedContextsValue}
      }
  );
  info.GetReturnValue()->Set(ctx->CreateObject(map));
}

std::shared_ptr<CtxValue> MemoryModule::BindFunction(std::shared_ptr<Scope> scope,
                                                     std::shared_ptr<CtxValue>* rest_args) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("Get");
  auto wrapper = std::make_unique<hippy::napi::FuncWrapper>(InvokeMemoryModuleGet, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFuncWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

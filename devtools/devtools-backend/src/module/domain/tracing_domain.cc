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

#include "module/domain/tracing_domain.h"
#include "module/domain_register.h"
#include "module/inspect_event.h"

namespace hippy::devtools {

constexpr char kParamsValue[] = "value";
constexpr char kParamsDataLossOccurred[] = "dataLossOccurred";

constexpr char kEventMethodTracingDataCollected[] = "Tracing.dataCollected";
constexpr char kEventMethodTracingComplete[] = "Tracing.tracingComplete";

std::string TracingDomain::GetDomainName() {
  return kFrontendKeyDomainNameTracing;
}

void TracingDomain::RegisterMethods() {
  REGISTER_DOMAIN(TracingDomain, Start, BaseRequest)
  REGISTER_DOMAIN(TracingDomain, End, BaseRequest)
}

void TracingDomain::RegisterCallback() {}

void TracingDomain::Start(const BaseRequest &request) {
  ResponseResultToFrontend(request.GetId(), "{}");
  auto tracing_adapter = GetDataProvider()->tracing_adapter;
  if (tracing_adapter) {
    tracing_adapter->StartTracing();
  }
}

void TracingDomain::End(const BaseRequest &request) {
  ResponseResultToFrontend(request.GetId(), "{}");
  auto tracing_adapter = GetDataProvider()->tracing_adapter;
  if (tracing_adapter) {
    tracing_adapter->StopTracing(kParamsValue, [request, WEAK_THIS](std::string result) {
      DEFINE_AND_CHECK_SELF(TracingDomain)
      self->SendEventToFrontend(InspectEvent(kEventMethodTracingDataCollected, std::move(result)));
      auto complete = nlohmann::json::object();
      complete[kParamsDataLossOccurred] = false;
      self->SendEventToFrontend(InspectEvent(kEventMethodTracingComplete, complete.dump()));
    });
  }
}

}  // namespace hippy::devtools

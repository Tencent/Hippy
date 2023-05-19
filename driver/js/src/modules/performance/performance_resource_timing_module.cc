/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

#include "driver/modules/performance/performance_resource_timing_module.h"

#include "driver/performance/performance_resource_timing.h"
#include "footstone/time_point.h"
#include "footstone/string_view.h"

using string_view = footstone::string_view;
using PerformanceResourceTiming = hippy::PerformanceResourceTiming;

namespace hippy {
inline namespace driver {
inline namespace module {

std::shared_ptr<ClassTemplate<PerformanceResourceTiming>> RegisterPerformanceResourceTiming(const std::weak_ptr<Scope>& weak_scope) {
  ClassTemplate<PerformanceResourceTiming> class_template;
  class_template.name = "PerformanceResourceTiming";
  class_template.constructor = [weak_scope](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<PerformanceResourceTiming> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (!external) {
      exception = context->CreateException("legal constructor");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("name error");
      return nullptr;
    }
    int32_t type;
    flag = context->GetValueNumber(arguments[1], &type);
    if (!flag || type < 0) {
      exception = context->CreateException("type error");
      return nullptr;
    }

    auto entry = scope->GetPerformance()->GetEntriesByName(name, static_cast<PerformanceEntry::Type>(type));
    if (!entry) {
      exception = context->CreateException("entry not found");
      return nullptr;
    }
    return std::static_pointer_cast<PerformanceResourceTiming>(entry);
  };

  PropertyDefine<PerformanceResourceTiming> initiator_type;
  initiator_type.name = "initiatorType";
  initiator_type.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateString(PerformanceResourceTiming::GetInitiatorString(thiz->GetInitiatorType()));
  };
  class_template.properties.push_back(std::move(initiator_type));

  PropertyDefine<PerformanceResourceTiming> next_hop_protocol;
  next_hop_protocol.name = "nextHopProtocol";
  next_hop_protocol.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateString(thiz->GetNextHopProtocol());
  };
  class_template.properties.push_back(std::move(next_hop_protocol));

  PropertyDefine<PerformanceResourceTiming> redirect_start;
  redirect_start.name = "redirectStart";
  redirect_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetRedirectStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(redirect_start));

  PropertyDefine<PerformanceResourceTiming> redirect_end;
  redirect_end.name = "redirectEnd";
  redirect_end.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetRedirectEnd().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(redirect_end));

  PropertyDefine<PerformanceResourceTiming> fetch_start;
  fetch_start.name = "fetchStart";
  fetch_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetFetchStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(fetch_start));

  PropertyDefine<PerformanceResourceTiming> domain_lookup_start;
  domain_lookup_start.name = "domainLookupStart";
  domain_lookup_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetDomainLookupStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(domain_lookup_start));

  PropertyDefine<PerformanceResourceTiming> domain_lookup_end;
  domain_lookup_end.name = "domainLookupEnd";
  domain_lookup_end.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetDomainLookupEnd().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(domain_lookup_end));

  PropertyDefine<PerformanceResourceTiming> connect_start;
  connect_start.name = "connectStart";
  connect_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetConnectStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(connect_start));

  PropertyDefine<PerformanceResourceTiming> connect_end;
  connect_end.name = "connectEnd";
  connect_end.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetConnectEnd().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(connect_end));

  PropertyDefine<PerformanceResourceTiming> secure_connection_start;
  secure_connection_start.name = "secureConnectionStart";
  secure_connection_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetSecureConnectionStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(secure_connection_start));

  PropertyDefine<PerformanceResourceTiming> request_start;
  request_start.name = "requestStart";
  request_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetRequestStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(request_start));

  PropertyDefine<PerformanceResourceTiming> response_start;
  response_start.name = "responseStart";
  response_start.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetResponseStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(response_start));

  PropertyDefine<PerformanceResourceTiming> response_end;
  response_end.name = "responseEnd";
  response_end.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetResponseEnd().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(response_end));

  PropertyDefine<PerformanceResourceTiming> transfer_size;
  transfer_size.name = "transferSize";
  transfer_size.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(footstone::checked_numeric_cast<uint64_t, double>(thiz->GetTransferSize()));
  };
  class_template.properties.push_back(std::move(transfer_size));

  PropertyDefine<PerformanceResourceTiming> encoded_body_size;
  encoded_body_size.name = "encodedBodySize";
  encoded_body_size.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(footstone::checked_numeric_cast<uint64_t, double>(thiz->GetEncodedBodySize()));
  };
  class_template.properties.push_back(std::move(encoded_body_size));

  PropertyDefine<PerformanceResourceTiming> decoded_body_size;
  decoded_body_size.name = "decodedBodySize";
  decoded_body_size.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(footstone::checked_numeric_cast<uint64_t, double>(thiz->GetDecodedBodySize()));
  };
  class_template.properties.push_back(std::move(decoded_body_size));

  return std::make_shared<ClassTemplate<PerformanceResourceTiming>>(std::move(class_template));
}

}
}
}

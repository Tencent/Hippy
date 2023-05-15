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

#pragma once

#include "driver/performance/performance_entry.h"

namespace hippy {
inline namespace driver {
inline namespace performance {

class PerformanceResourceTiming: public PerformanceEntry {
 public:
  enum class InitiatorType {
    AUDIO, BEACON, BODY, CSS, EARLY_HINT, EMBED, FETCH, FRAME, IFRAME, ICON, IMAGE, IMG, INPUT, LINK, NAVIGATION, OBJECT,
    PING, SCRIPT, TRACK, VIDEO, XMLHTTPREQUEST
  };

  PerformanceResourceTiming(const string_view& name, TimePoint start_time, TimeDelta duration,
                            const InitiatorType& initiator_type, const string_view& next_hop_protocol, TimePoint worker_start,
                            TimePoint redirect_start, TimePoint redirect_end, TimePoint fetch_start,
                            TimePoint domain_lookup_start, TimePoint domain_lookup_end, TimePoint connect_start,
                            TimePoint connect_end, TimePoint secure_connection_start, TimePoint request_start_,
                            TimePoint response_start, TimePoint response_end,  uint64_t transfer_size,
                            uint64_t encoded_body_size, uint64_t decoded_body_size);

  inline InitiatorType GetInitiatorType() {
    return initiator_type_;
  }

  inline string_view GetNextHopProtocol() {
    return next_hop_protocol_;
  }

  inline TimePoint GetWorkerStart() {
    return worker_start_;
  }

  inline TimePoint GetRedirectStart() {
    return redirect_start_;
  }

  inline TimePoint GetRedirectEnd() {
    return redirect_end_;
  }

  inline TimePoint GetFetchStart() {
    return fetch_start_;
  }

  inline TimePoint GetDomainLookupStart() {
    return domain_lookup_start_;
  }

  inline TimePoint GetDomainLookupEnd() {
    return domain_lookup_end_;
  }

  inline TimePoint GetConnectStart() {
    return connect_start_;
  }

  inline TimePoint GetConnectEnd() {
    return connect_end_;
  }

  inline TimePoint GetSecureConnectionStart() {
    return secure_connection_start_;
  }

  inline TimePoint GetRequestStart() {
    return request_start_;
  }

  inline TimePoint GetResponseStart() {
    return response_start_;
  }

  inline TimePoint GetResponseEnd() {
    return response_end_;
  }

  inline uint64_t GetTransferSize() {
    return transfer_size_;
  }

  inline uint64_t GetEncodedBodySize() {
    return encoded_body_size_;
  }

  inline uint64_t GetDecodedBodySize() {
    return decoded_body_size_;
  }

  virtual string_view ToJSON() override;

  static string_view GetInitiatorString(InitiatorType type);

 private:
  InitiatorType initiator_type_;
  string_view next_hop_protocol_;
  TimePoint worker_start_;
  TimePoint redirect_start_;
  TimePoint redirect_end_;
  TimePoint fetch_start_;
  TimePoint domain_lookup_start_;
  TimePoint domain_lookup_end_;
  TimePoint connect_start_;
  TimePoint connect_end_;
  TimePoint secure_connection_start_;
  TimePoint request_start_;
  TimePoint response_start_;
  TimePoint response_end_;
  uint64_t transfer_size_;
  uint64_t encoded_body_size_;
  uint64_t decoded_body_size_;
  // std::vector<> server_timing_{};
};

}
}
}

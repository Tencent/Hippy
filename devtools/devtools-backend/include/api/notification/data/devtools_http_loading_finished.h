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

#pragma once

#include <ctime>
#include <string>
#include "api/adapter/data/serializable.h"

namespace hippy::devtools {

/**
 * CDP network protocol, loading finished event data body
 * #see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-loadingFinished
 */
class DevtoolsLoadingFinished : public Serializable {
 public:
  DevtoolsLoadingFinished(std::string request_id, uint32_t length)
      : request_id_(request_id),
        encoded_data_length_(length),
        timestamp_(static_cast<uint64_t>(std::time(nullptr))),
        should_report_corb_blocking_(false) {}

  inline void SetTimestamp(uint64_t timestamp) { timestamp_ = timestamp; }
  explicit DevtoolsLoadingFinished(std::string content) : content_(std::move(content)) {}

  inline void SetReportCorbBlocking(bool blocking) { should_report_corb_blocking_ = blocking; }
  std::string Serialize() const override;

 private:
  std::string content_;
  std::string request_id_;
  uint32_t encoded_data_length_;
  uint64_t timestamp_;
  bool should_report_corb_blocking_;
};
}  // namespace hippy::devtools

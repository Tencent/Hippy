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

#include <string>
#include "module/request/base_request.h"

namespace hippy::devtools {
/**
 * @brief screenshot request
 */
class ScreenShotRequest : public BaseRequest {
 public:
  void Deserialize(const std::string& params) override;

  inline int32_t GetQuality() const { return quality_; }
  inline int32_t GetMaxWidth() const { return max_width_; }
  inline int32_t GetMaxHeight() const { return max_height_; }
  inline std::string GetFormat() const { return format_; }

 private:
  std::string format_;
  int32_t quality_;
  int32_t max_width_;
  int32_t max_height_;
};
}  // namespace hippy::devtools

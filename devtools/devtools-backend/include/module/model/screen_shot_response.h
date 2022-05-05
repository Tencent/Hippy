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

namespace hippy::devtools {
/**
 * @brief screenshot response model
 */
class ScreenShotResponse {
 public:
  ScreenShotResponse() = default;
  ScreenShotResponse(const std::string &screen_data, int32_t width, int32_t height)
      : screen_data_(screen_data), screen_width_(width), screen_height_(height) {}

  /**
   * @brief screenshot model to json
   * @return json struct
   */
  std::string ToJsonString() const;

 private:
  std::string screen_data_;
  int32_t screen_width_;
  int32_t screen_height_;
};
}  // namespace hippy::devtools

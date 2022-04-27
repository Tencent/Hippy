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

#include "module/model/screen_shot_response.h"
#include "devtools_base/transform_string_util.hpp"
#include "module/inspect_props.h"

namespace hippy::devtools {

constexpr char kFrontendKeyOffsetTop[] = "offsetTop";
constexpr char kFrontendKeyPageScaleFactor[] = "pageScaleFactor";
constexpr char kFrontendKeyScrollOffsetX[] = "scrollOffsetX";
constexpr char kFrontendKeyScrollOffsetY[] = "scrollOffsetY";
constexpr char kDefaultJointStringZero[] = "\":0,\"";
constexpr char kDefaultJointStringOne[] = "\":1,\"";

std::string ScreenShotResponse::ToJsonString() const {
  if (screen_data_.empty()) {
    return "{}";
  }
  struct timeval time;
  std::string result_string = "{\"";
  result_string += kFrontendKeyData;
  result_string += "\":\"";
  result_string += screen_data_;
  result_string += "\",\"";
  result_string += kFrontendKeyMetadata;
  result_string += "\":{\"";
  result_string += kFrontendKeyOffsetTop;
  result_string += kDefaultJointStringZero;
  result_string += kFrontendKeyPageScaleFactor;
  result_string += kDefaultJointStringOne;
  result_string += kFrontendKeyDeviceWidth;
  result_string += "\":";
  result_string += TransformStringUtil::NumbertoString(screen_width_);
  result_string += ",\"";
  result_string += kFrontendKeyDeviceHeight;
  result_string += "\":";
  result_string += TransformStringUtil::NumbertoString(screen_height_);
  result_string += ",\"";
  result_string += kFrontendKeyScrollOffsetX;
  result_string += kDefaultJointStringZero;
  result_string += kFrontendKeyScrollOffsetY;
  result_string += kDefaultJointStringZero;
  result_string += kFrontendKeyTimestamp;
  result_string += "\":";
  result_string += TransformStringUtil::NumbertoString(time.tv_usec);
  result_string += "},\"";
  result_string += kFrontendKeySessionId;
  result_string += "\":";
  result_string += TransformStringUtil::NumbertoString(time.tv_usec);
  result_string += "}";
  return result_string;
}
}  // namespace devtools::devtools

//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/7/16.
//

#include "module/model/screen_shot_response.h"
#include "devtools_base/transform_string_util.hpp"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

constexpr const char *kFrontendKeyOffsetTop = "offsetTop";
constexpr const char *kFrontendKeyPageScaleFactor = "pageScaleFactor";
constexpr const char *kFrontendKeyScrollOffsetX = "scrollOffsetX";
constexpr const char *kFrontendKeyScrollOffsetY = "scrollOffsetY";
constexpr const char *kDefaultJointStringZero = "\":0,\"";
constexpr const char *kDefaultJointStringOne = "\":1,\"";

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
}  // namespace devtools
}  // namespace tdf

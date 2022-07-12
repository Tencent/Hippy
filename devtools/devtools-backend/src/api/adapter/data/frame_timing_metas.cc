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

#include "api/adapter/data/frame_timing_metas.h"
#include <sstream>
#include "module/util/transform_string_util.h"

namespace hippy::devtools {

constexpr char kFrameKeyFrameTimings[] = "frameTimings";
constexpr char kFrameKeyUI[] = "ui";
constexpr char kFrameKeyRaster[] = "raster";
constexpr char kMemoryKeyBegin[] = "b";
constexpr char kMemoryKeyEnd[] = "e";

std::string FrameTimingMetas::Serialize() const {
  std::string result_string = "{\"";
  result_string += kFrameKeyFrameTimings;
  result_string += "\":[";
  for (const FrameMeta& meta : metas_) {
    std::string element_string = "{\"";
    element_string += kFrameKeyUI;
    element_string += "\":{\"";
    element_string += kMemoryKeyBegin;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(meta.ui_begin);
    element_string += ",\"";
    element_string += kMemoryKeyEnd;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(meta.ui_end);
    element_string += "},\"";
    element_string += kFrameKeyRaster;
    element_string += "\":{\"";
    element_string += kMemoryKeyBegin;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(meta.raster_begin);
    element_string += ",\"";
    element_string += kMemoryKeyEnd;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(meta.raster_end);
    element_string += "}}";
    element_string += ",";
    result_string += element_string;
  }
  result_string.pop_back();
  result_string += !metas_.empty() ? "]}" : "[]}";
  return result_string;
}

}  // namespace hippy::devtools

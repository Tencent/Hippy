//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#include "api/adapter/data/frame_timing_metas.h"
#include <sstream>
#include "devtools_base/transform_string_util.hpp"

namespace tdf {
namespace devtools {

constexpr const char* kFrameKeyFrameTimings = "frameTimings";
constexpr const char* kFrameKeyUI = "ui";
constexpr const char* kFrameKeyRaster = "raster";
constexpr const char* kMemoryKeyBegin = "b";
constexpr const char* kMemoryKeyEnd = "e";

void FrameTimingMetas::AddMeta(const FrameMeta& meta) { metas_.emplace_back(meta); }

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
  result_string += metas_.size() ? "]}" : "[]}";
  return result_string;
}

}  // namespace devtools
}  // namespace tdf

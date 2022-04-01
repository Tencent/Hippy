//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#pragma once

#include <chrono>
#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {
struct FrameMeta {
  std::time_t ui_begin;
  std::time_t ui_end;
  std::time_t raster_begin;
  std::time_t raster_end;
  FrameMeta(std::time_t ui_begin, std::time_t ui_end, std::time_t raster_begin, std::time_t raster_end)
      : ui_begin(ui_begin), ui_end(ui_end), raster_begin(raster_begin), raster_end(raster_end) {}
};

class FrameTimingMetas : public Serializable {
 public:
  void AddMeta(const FrameMeta& meta);
  std::string Serialize() const override;

 private:
  std::vector<FrameMeta> metas_;
};
}  // namespace devtools
}  // namespace tdf


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
#include <vector>
#include "api/adapter/data/serializable.h"

namespace hippy::devtools {
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
  inline void AddMeta(const FrameMeta& meta) { metas_.emplace_back(meta); }
  std::string Serialize() const override;

 private:
  std::vector<FrameMeta> metas_;
};
}  // namespace hippy::devtools


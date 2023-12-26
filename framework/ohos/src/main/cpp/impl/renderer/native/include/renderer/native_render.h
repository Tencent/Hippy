/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

#include "renderer/utils/hr_types.h"

namespace hippy {
inline namespace render {
inline namespace native {

class NativeRender : public std::enable_shared_from_this<NativeRender> {
public:
  NativeRender() {}
  virtual ~NativeRender() = default;
  
  virtual std::string GetBundlePath() = 0;
  
  virtual void OnSizeChanged(uint32_t root_id, float width, float height) = 0;
  virtual void OnSizeChanged2(uint32_t root_id, uint32_t node_id, float width, float height, bool isSync) = 0;

  virtual HRPosition GetRootViewtPositionInWindow(uint32_t root_id) = 0;

  virtual uint64_t AddEndBatchCallback(uint32_t root_id, const EndBatchCallback &cb) = 0;
  virtual void RemoveEndBatchCallback(uint32_t root_id, uint64_t cbId) = 0;
  
};

} // namespace native
} // namespace render
} // namespace hippy

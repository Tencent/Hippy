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

#include <map>
#include <mutex>
#include "dom/render_manager.h"
#include "renderer/text_measure/text_measurer.h"

namespace hippy {
inline namespace render {
inline namespace native {

class TextMeasureCache {
public:
  // 对于“增-删-增”同一个id的节点，dom线程会连续绘制文本，但主线程后续才触发删，为了保证不删掉第2次创建的文本，加一个引用计数
  int32_t refCount_ = 0;
  std::shared_ptr<TextMeasurer> used_ = nullptr;
  std::shared_ptr<TextMeasurer> builded_ = nullptr;
};

class TextMeasureManager {
public:
  TextMeasureManager() {}
  ~TextMeasureManager() {}
  
  void SaveNewTextMeasurer(uint32_t node_id, std::shared_ptr<TextMeasurer> text_measurer, int32_t incRefCount) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = text_measurer_map_.find(node_id);
    if (it != text_measurer_map_.end()) {
      auto &cache = it->second;
      cache->refCount_ += incRefCount;
      cache->builded_ = text_measurer;
    } else {
      auto cache = std::make_shared<TextMeasureCache>();
      cache->refCount_ = incRefCount;
      cache->builded_ = text_measurer;
      text_measurer_map_[node_id] = cache;
    }
  }
  
  bool HasNewTextMeasurer(uint32_t node_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = text_measurer_map_.find(node_id);
    if (it != text_measurer_map_.end()) {
      auto cache = it->second;
      if (cache->builded_) {
        return true;
      }
    }
    return false;
  }
  
  std::shared_ptr<TextMeasurer> UseNewTextMeasurer(uint32_t node_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = text_measurer_map_.find(node_id);
    if (it != text_measurer_map_.end()) {
      auto cache = it->second;
      if (cache->builded_) {
        cache->used_ = cache->builded_;
        cache->builded_ = nullptr;
        return cache->used_;
      }
    }
    return nullptr;
  }
  
  std::shared_ptr<TextMeasurer> GetUsedTextMeasurer(uint32_t node_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = text_measurer_map_.find(node_id);
    if (it != text_measurer_map_.end()) {
      auto cache = it->second;
      return cache->used_;
    }
    return nullptr;
  }

  void EraseTextMeasurer(uint32_t node_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = text_measurer_map_.find(node_id);
    if (it != text_measurer_map_.end()) {
      auto &cache = it->second;
      cache->refCount_ -= 1;
      if (cache->refCount_ <= 0) {
        text_measurer_map_.erase(it);
      }
    }
  }
  
private:
  std::map<uint32_t, std::shared_ptr<TextMeasureCache>> text_measurer_map_;
  std::mutex mutex_;
};

class DrawTextNodeInfo {
public:
  int32_t inc_create_count_ = 0;
  float draw_width_ = 0;
  std::weak_ptr<DomNode> draw_node_;
};

class DrawTextNodeCache {
public:
  std::map<uint32_t, std::shared_ptr<DrawTextNodeInfo>> draw_text_nodes_;
};

class DrawTextNodeManager {
public:
  std::shared_ptr<DrawTextNodeCache> GetCache(uint32_t rootId) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = cache_map_.find(rootId);
    if (it != cache_map_.end()) {
      return it->second;
    }
    auto cache = std::make_shared<DrawTextNodeCache>();
    cache_map_[rootId] = cache;
    return cache;
  }
  
  void RemoveCache(uint32_t rootId) {
    std::lock_guard<std::mutex> lock(mutex_);
    cache_map_.erase(rootId);
  }
  
private:
  std::map<uint32_t, std::shared_ptr<DrawTextNodeCache>> cache_map_;
  std::mutex mutex_;
};

} // namespace native
} // namespace render
} // namespace hippy

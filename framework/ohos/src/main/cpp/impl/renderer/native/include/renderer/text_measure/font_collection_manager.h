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

#include "footstone/logging.h"
#include <map>
#include <mutex>
#include <set>
#include <native_drawing/drawing_font_collection.h>
#include <native_drawing/drawing_register_font.h>

namespace hippy {
inline namespace render {
inline namespace native {

class FontCollectionCache {
public:
  bool HasFont(const std::string &fontName) {
    auto it = fontNames_.find(fontName);
    if (it != fontNames_.end()) {
      return true;
    }
    return false;
  }
  
  void RegisterFont(const std::string &fontName, const std::string &fontPath) {
    auto it = fontNames_.find(fontName);
    if (it != fontNames_.end()) {
      return;
    }
    fontNames_.insert(fontName);
    uint32_t ret = OH_Drawing_RegisterFont(fontCollection_, fontName.c_str(), fontPath.c_str());
    if (ret != 0) {
      FOOTSTONE_LOG(ERROR) << "Measure Text OH_Drawing_RegisterFont(" << fontName << ", " << fontPath << ") fail";
    }
  }
  
  OH_Drawing_FontCollection *fontCollection_ = nullptr;
  std::set<std::string> fontNames_;
};

class FontCollectionManager {
public:
  ~FontCollectionManager() {
    for (auto it = cache_map_.begin(); it != cache_map_.end(); it++) {
      auto cache = it->second;
      if (cache->fontCollection_) {
        OH_Drawing_DestroyFontCollection(cache->fontCollection_);
        cache->fontCollection_ = nullptr;
      }
    }
  }
  
  std::shared_ptr<FontCollectionCache> GetCache(uint32_t rootId) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = cache_map_.find(rootId);
    if (it != cache_map_.end()) {
      return it->second;
    }
    auto cache = std::make_shared<FontCollectionCache>();
    cache->fontCollection_ = OH_Drawing_CreateSharedFontCollection();
    cache_map_[rootId] = cache;
    return cache;
  }
  
  void RemoveCache(uint32_t rootId) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = cache_map_.find(rootId);
    if (it != cache_map_.end()) {
      auto cache = it->second;
      if (cache->fontCollection_) {
        OH_Drawing_DestroyFontCollection(cache->fontCollection_);
        cache->fontCollection_ = nullptr;
      }
    }
    cache_map_.erase(rootId);
  }
private:
  std::map<uint32_t, std::shared_ptr<FontCollectionCache>> cache_map_;
  std::mutex mutex_;
};

} // namespace native
} // namespace render
} // namespace hippy

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

#include <memory>
#include <mutex>
#include <unordered_map>

namespace tdf {
namespace base {

template <typename Key, typename Tp>
class PersistentObjectMap {
 public:
  using key_type = Key;
  using mapped_type = Tp;
  using value_type = std::pair<const key_type, mapped_type>;
  using reference = value_type &;
  using const_iterator = typename std::unordered_map<key_type, mapped_type>::const_iterator;
  using iterator = typename std::unordered_map<key_type, mapped_type>::iterator;

  PersistentObjectMap() {}
  virtual ~PersistentObjectMap() = default;
  PersistentObjectMap(const PersistentObjectMap &) = delete;
  PersistentObjectMap &operator=(const PersistentObjectMap &) = delete;
  PersistentObjectMap(PersistentObjectMap &&) = delete;
  PersistentObjectMap &operator=(PersistentObjectMap &&) = delete;

  void Clear() {
    std::lock_guard<std::mutex> lock(mutex_);
    map_.clear();
  }

  bool Insert(const key_type &key, const mapped_type &value) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto ret = map_.insert({key, value});
    return ret.second;
  }

  bool Emplace(const key_type &key, const mapped_type &value) {
    std::lock_guard<std::mutex> lock(mutex_);
    auto pair = map_.emplace({key, value});
    return pair.second;
  }

  bool Find(const key_type &key, mapped_type &value) const {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = map_.find(key);
    if (it == map_.end()) {
      return false;
    }
    value = it->second;
    return true;
  }

  bool Erase(const key_type &key) {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto it = map_.find(key);
    if (it == map_.end()) return false;
    map_.erase(it);
    return true;
  }

 private:
  std::unordered_map<key_type, mapped_type> map_;
  mutable std::mutex mutex_;
};

}  // namespace base
}  // namespace tdf

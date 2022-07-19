/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include <unordered_map>
#include <vector>

namespace std {
template <class T>
inline void hash_combine(size_t& seed, T const& v) {
  seed ^= hash<T>()(v) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
}

template <typename T>
struct hash<vector<T>> {
  size_t operator()(vector<T> const& in) const {
    size_t size = in.size();
    size_t seed = 0;
    for (size_t i = 0; i < size; i++)
      // Combine the hash of the current vector with the hashes of the previous
      // ones
      hash_combine(seed, in[i]);
    return seed;
  }
};

template <typename K, typename V>
struct hash<unordered_map<K, V>> {
  size_t operator()(unordered_map<K, V> const& in) const {
    size_t seed = 0;
    for (auto& v : in) {
      // Combine the hash of the current vector with the hashes of the previous
      // ones
      hash_combine(seed, v.first);
      hash_combine(seed, v.second);
    }
    return seed;
  }
};
}  // namespace std

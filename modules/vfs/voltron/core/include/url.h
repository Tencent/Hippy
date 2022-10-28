/*
 *
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

#include <string>
#include <utility>
#include <iostream>
#include <vector>

namespace voltron {

class KeyValPair {
 public:
  // Default constructor
  KeyValPair() = default;

  // Construct with provided Key and Value strings
  KeyValPair(std::string key, std::string val) : key_(std::move(key)), val_(std::move(val)) {}

  // Construct with provided Key string, val will be empty
  explicit KeyValPair(std::string key) : key_(std::move(key)) {}

  // Equality test operator
  bool operator==(const KeyValPair &other) const;

  // Get key
  const std::string& key() const {
    return key_;
  }

  // Set key
  void key(const std::string &k) {
    key_ = k;
  }

  // Get value
  const std::string& val() const {
    return val_;
  }

  // Set value
  void val(const std::string &v) {
    val_ = v;
  }

  // Output key value pair
  friend std::ostream& operator<<(std::ostream &o, const KeyValPair &kv);

 private:
  std::string key_;
  std::string val_;
};

// Define Query as vector of Key Value pairs
typedef std::vector<KeyValPair> Query;
typedef size_t (*kv_callback)(void* list, std::string k, std::string v);

class Url {
 public:
  Url() = default;
  explicit Url(std::string url);
  ~Url() = default;

  const std::string& url() const {
    return url_;
  }

  const std::string& scheme() const {
    return scheme_;
  }

  const std::string& host() const {
    return host_;
  }

  const std::string& port() const {
    return port_;
  }

  const std::string& path() const {
    return path_;
  }

  const std::string& query() const {
    return query_;
  }

  const Query& query_map() const {
    return query_map_;
  }

  bool is_valid() const {
    if (!url_.empty() && !scheme_.empty() && !host_.empty()) {
      return true;
    } else {
      return false;
    }
  }

  std::string UrlDecode();
  std::string UrlEncode();

  static size_t ParseKeyValueList(std::vector<KeyValPair > *kvvec,
                                  const std::string& query_str, bool strict);
  static size_t ParseKeyValue(const std::string& query_str,
                              kv_callback kvcb, void* obj, bool strict);
  static size_t ParsePath(std::vector<std::string>* folders, std::string pathstr);

 private:
  void ParseUrl();

  std::string scheme_;
  std::string host_;
  std::string port_;
  std::string path_;
  std::string query_;
  Query query_map_;
  std::string fragment_;
  std::string url_;
};
}  // namespace voltron

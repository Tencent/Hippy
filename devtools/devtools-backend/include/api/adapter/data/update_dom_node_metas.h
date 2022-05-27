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

namespace hippy::devtools {

class CssStyleMetas;

class UpdateDomNodeMetas {
 public:
  explicit UpdateDomNodeMetas(int32_t id, std::vector<CssStyleMetas> list) : node_id_(id), style_metas_list_(list) {}

  inline int32_t GetNodeId() const { return node_id_; }
  inline std::vector<CssStyleMetas> GetStyleMetasList() const { return style_metas_list_; }

 private:
  int32_t node_id_;
  std::vector<CssStyleMetas> style_metas_list_;  // css style properties list
};

/**
 * css style property data
 */
class CssStyleMetas {
 public:
  // property value type. currently supports double and string, but can be extended later
  enum class Type { kDouble, kString };

  /**
   * @brief default constructor，the default property value is double
   */
  CssStyleMetas() : key_(""), type_(Type::kDouble), double_value_(0.f) {}

  /**
   * @brief construct a property of type double
   */
  explicit CssStyleMetas(std::string key, double number) : key_(key), type_(Type::kDouble), double_value_(number) {}

  /**
   * @brief construct a property of type string
   */
  explicit CssStyleMetas(std::string key, std::string string)
      : key_(key), type_(Type::kString), string_value_(string) {}

  /**
   * @brief property is double type
   */
  inline bool IsDouble() const noexcept { return type_ == Type::kDouble; }

  /**
   * @brief property is string type
   */
  inline bool IsString() const noexcept { return type_ == Type::kString; }

  /**
   * @brief get string type value
   */
  inline std::string ToString() { return IsString() ? string_value_ : ""; }

  /**
   * @brief get double type value
   */
  inline double ToDouble() const { return IsDouble() ? double_value_ : 0.f; }

  inline std::string GetKey() { return key_; }

 private:
  std::string key_;  // property name
  Type type_;        // property type
  double double_value_;
  std::string string_value_;
};
}  // namespace hippy::devtools

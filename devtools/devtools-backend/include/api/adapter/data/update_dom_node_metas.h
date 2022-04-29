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

#include <chrono>
#include <string>
#include <vector>

namespace hippy::devtools {

class CSSStyleMetas;


class UpdateDomNodeMetas {
 public:
  UpdateDomNodeMetas() = default;
  explicit UpdateDomNodeMetas(int32_t id, std::vector<CSSStyleMetas> list) : node_id_(id), style_metas_list_(list) {}

  int32_t GetNodeId() { return node_id_; }
  std::vector<CSSStyleMetas> GetStyleMetasList() { return style_metas_list_; }

 private:
  int32_t node_id_;
  std::vector<CSSStyleMetas> style_metas_list_;  // css style properties list
};

/**
 * css style 属性数据
 */
class CSSStyleMetas {
 public:
  enum class Type { kDouble, kString };  // 属性值类型，目前支持 double 和 string，后续可以扩展

  /**
   * @brief 默认构造函数，默认属性值为 double 类型
   */
  CSSStyleMetas() : key_(""), type_(Type::kDouble), double_value_(0.f) {}

  /**
   * @brief 构造 double 类型的属性
   */
  explicit CSSStyleMetas(std::string key, double number) : key_(key), type_(Type::kDouble), double_value_(number) {}

  /**
   * @brief 构造 string 类型的属性
   */
  explicit CSSStyleMetas(std::string key, std::string string)
      : key_(key), type_(Type::kString), string_value_(string) {}

  /**
   * @brief 属性是否是 double 类型
   */
  bool IsDouble() const noexcept;

  /**
   * @brief 属性是否是 string 类型
   */
  bool IsString() const noexcept;

  /**
   * @brief 获取 string 类型属性值
   */
  std::string ToString();

  /**
   * @brief 获取 double 类型属性值
   */
  double ToDouble() const;

  std::string GetKey() { return key_; }

 private:
  std::string key_;            // 属性名
  Type type_;                  // 属性值类型
  double double_value_;
  std::string string_value_;
};

}  // namespace hippy::devtools

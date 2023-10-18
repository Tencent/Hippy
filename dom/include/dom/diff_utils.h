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

#include "footstone/hippy_value.h"

namespace hippy {
inline namespace dom {
using HippyValue = footstone::value::HippyValue;
using DomValueMap = typename std::unordered_map<std::string, std::shared_ptr<HippyValue>>;
using DomValueObject = typename std::unordered_map<std::string, HippyValue>;
using DomValueArray = typename std::vector<HippyValue>;
using DiffValue = typename std::tuple<std::shared_ptr<DomValueMap>, std::shared_ptr<std::vector<std::string>>>;

class DiffUtils {
 public:
  /**
   * @brief 对比新旧 style map 的差异
   * @param old_props_map 旧的 style map
   * @param new_props_map 新的 style map
   * @return 返回 需要更新的map 和 需要删除的 vector
   * @example
   *  old_props_map:                               new_props_map:                               update_props:
   * {                                               {                                            {
   *   a: 1,                                            a: 2                                        a: 2,
   *   b: { b1: 21, b2: 22 },                           b: { b1: 21, b2: 22 },                      c: { c1: 31, c2: { c21: 33 } },
   *   c: { c1: 31, c2: { c21: 32 } },                  c: { c1: 31, c2: { c21: 33 } },             d: { d1: 41, d2: 42 },
   *   d: { d1: 41 },                                   d: { d1: 41, d2: 42 },                      e: { e1: 52 }
   *   e: { c1: 51 },                   DiffProps       e: { e1: 52 },                              g: [ g1: 72 ],
   *   f: [ f1: 61, f2: 62 ],           -------->       f: [ f1: 61, f2: 62 ],           ----->     h: [ h1: 81, h2: 82 ],
   *   g: [ g1: 71 ],                                   g: [ g1: 72 ],                              i: [ i1: 91, i2: { i21: 92} ]
   *   h: [ h1: 81 ],                                   h: [ h1: 81, h2: 82 ],                    }
   *   i: [ i1: 91, i2: { i21: 91 } ],                  i: [ i1: 91, i2: { i21: 92} ],          delete props:
   *   j: 10,                                        }                                            [j, k]
   *   k: 11,
   * }
   */
  static DiffValue DiffProps(const DomValueMap& old_props_map, const DomValueMap& new_props_map, bool skip_style_diff);
};
}  // namespace dom
}  // namespace hippy

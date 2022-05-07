//
// Copyright (c) 2021 Tencent. All rights reserved.
// Created by omegaxiao on 2021/11/26.
//
#pragma once

#include "dom_value.h"

namespace hippy {
inline namespace dom {
using DomValue = tdf::base::DomValue;
using DomValueMap = typename std::unordered_map<std::string, std::shared_ptr<DomValue>>;
using DomValueObject = typename std::unordered_map<std::string, DomValue>;
using DomValueArray = typename std::vector<DomValue>;
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
  static DiffValue DiffProps(const DomValueMap& old_props_map, const DomValueMap& new_props_map);
};
}  // namespace dom
}  // namespace hippy

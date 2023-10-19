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

#include "dom/diff_utils.h"

#include "dom/node_props.h"
#include "footstone/logging.h"
namespace hippy {
inline namespace dom {

static bool ShouldUpdateProperty(const std::string& key, const DomValueMap& old_props_map,
                                 const DomValueMap& new_props_map) {
  if (key == kMargin) {
    if ((new_props_map.find(kMarginLeft) == new_props_map.end() &&
         old_props_map.find(kMarginLeft) != old_props_map.end()) ||
        (new_props_map.find(kMarginRight) == new_props_map.end() &&
         old_props_map.find(kMarginRight) != old_props_map.end()) ||
        (new_props_map.find(kMarginTop) == new_props_map.end() &&
         old_props_map.find(kMarginTop) != old_props_map.end()) ||
        (new_props_map.find(kMarginBottom) == new_props_map.end() &&
         old_props_map.find(kMarginBottom) != old_props_map.end())) {
      return true;
    }
  }

  if (key == kPadding) {
    if ((new_props_map.find(kPaddingLeft) == new_props_map.end() &&
         old_props_map.find(kPaddingLeft) != old_props_map.end()) ||
        (new_props_map.find(kPaddingRight) == new_props_map.end() &&
         old_props_map.find(kPaddingRight) != old_props_map.end()) ||
        (new_props_map.find(kPaddingTop) == new_props_map.end() &&
         old_props_map.find(kPaddingTop) != old_props_map.end()) ||
        (new_props_map.find(kPaddingBottom) == new_props_map.end() &&
         old_props_map.find(kPaddingBottom) != old_props_map.end())) {
      return true;
    }
  }

  if (key == kBorderWidth) {
    if ((new_props_map.find(kBorderLeftWidth) == new_props_map.end() &&
         old_props_map.find(kBorderLeftWidth) != old_props_map.end()) ||
        (new_props_map.find(kBorderRightWidth) == new_props_map.end() &&
         old_props_map.find(kBorderRightWidth) != old_props_map.end()) ||
        (new_props_map.find(kBorderTopWidth) == new_props_map.end() &&
         old_props_map.find(kBorderTopWidth) != old_props_map.end()) ||
        (new_props_map.find(kBorderBottomWidth) == new_props_map.end() &&
         old_props_map.find(kBorderBottomWidth) != old_props_map.end())) {
      return true;
    }
  }

  return false;
}

DiffValue DiffUtils::DiffProps(const DomValueMap& old_props_map, const DomValueMap& new_props_map, bool skip_style_diff) {
  std::shared_ptr<DomValueMap> update_props = std::make_shared<DomValueMap>();
  std::shared_ptr<std::vector<std::string>> delete_props = std::make_shared<std::vector<std::string>>();
  if (skip_style_diff) {
    // 跳过 style diff 计算
    return std::make_tuple(update_props, delete_props);
  }

  // delete props
  // Example:
  //                                      diff                         delete
  //  old_props_map: { a: 1, b: 2, c: 3 } ---> new_props_map: { a: 1 } ----->  delete_props: [b, c]
  for (const auto& kv : old_props_map) {
    auto iter = new_props_map.find(kv.first);
    if (iter == new_props_map.end()) {
      delete_props->push_back(kv.first);
    }
  }

  // update props (update old prop)
  // Example:
  // old_props_map:                  new_props_map:           update_props:
  // {                               {                        {
  //   a: 1,                   diff    a: 11          update    a: 11
  //   b: { b1: 21, b2: 22 },  --->    b: { b1: 21 }  ----->    b: { b1: 21 }
  //   c: [ c1: 31, c2: 32 ]           c: [ c1: 31 ]            c: [ c1: 31 ]
  //   d: 4                          }                        }
  // }
  for (const auto& old_prop : old_props_map) {
    auto key = old_prop.first;
    auto new_prop_iter = new_props_map.find(key);
    // delete case has already been processed above
    if (new_prop_iter == new_props_map.end()) {
      continue;
    }
    // special case, update prop has key but no value
    FOOTSTONE_DCHECK(new_prop_iter->second != nullptr);

    // update props
    if (old_prop.second == nullptr || *old_prop.second != *new_prop_iter->second) {
      (*update_props)[key] = new_prop_iter->second;
    }

    // Some special layout properties should update even if the property has not changed
    // Example:
    // old_props_map: { margin: 10, marginBottom: 5 }
    // new_props_map: { margin: 10 }
    // margin should update, otherwise the layout engine will use last margin bottom value
    if (old_prop.second != nullptr && *old_prop.second == *new_prop_iter->second) {
      if (ShouldUpdateProperty(key, old_props_map, new_props_map)) {
        (*update_props)[key] = new_prop_iter->second;
      }
    }
  }

  // update props (insert new prop)
  // Example:
  // old_props_map:        new_props_map:            update_props:
  //                       {                         {
  // {               diff    b: 2          update      b: 2,
  //   a: 1,         --->    c: { c1: 31 }  ----->     c: { c1: 31 },
  // }                       d: [ d1: 41 ]             d: [ d1: 41 ],
  //                       }                         }
  for (const auto& new_prop : new_props_map) {
    auto key = new_prop.first;
    if (old_props_map.find(key) != old_props_map.end()) {
      continue;
    }
    (*update_props)[key] = new_prop.second;
  }

  DiffValue diff_props = std::make_tuple(update_props, delete_props);
  return diff_props;
}
}  // namespace dom
}  // namespace hippy

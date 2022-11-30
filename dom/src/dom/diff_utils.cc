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
#include "footstone/logging.h"
#include "dom/node_props.h"
namespace hippy {
inline namespace dom {
DiffValue DiffUtils::DiffProps(const DomValueMap& old_props_map, const DomValueMap& new_props_map) {
  std::shared_ptr<DomValueMap> update_props = std::make_shared<DomValueMap>();
  std::shared_ptr<std::vector<std::string>> delete_props = std::make_shared<std::vector<std::string>>();

  // delete props
  // Example:
  //                                      diff                         delete
  //  old_props_map: { a: 1, b: 2, c: 3 } ---> new_props_map: { a: 1 } ----->  delete_props: [b, c]
  for (const auto& kv : old_props_map) {
    auto iter = new_props_map.find(kv.first);
    if (iter == new_props_map.end()) {
      delete_props->push_back(kv.first);
      update_props->insert(std::make_pair(kv.first, nullptr));
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
    if (old_prop.second == nullptr || old_prop.second.get() != new_prop_iter->second.get()) {
      (*update_props)[key] = new_prop_iter->second;
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

  if (delete_props->empty()) {
    delete_props = nullptr;
  }
  if (update_props->empty()) {
    update_props = nullptr;
  }
  DiffValue diff_props = std::make_tuple(update_props, delete_props);
  return diff_props;
}
}  // namespace dom
}  // namespace hippy

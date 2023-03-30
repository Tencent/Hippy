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

#include <any>

#include "footstone/persistent_object_map.h"

namespace voltron {
inline namespace ffi {

extern std::atomic<uint32_t> global_data_holder_key;
extern footstone::utils::PersistentObjectMap<uint32_t, std::any> global_data_holder;

extern uint32_t InsertObject(const std::any& obj);

extern void InsertObject(uint32_t id, const std::any& obj);

extern uint32_t GenId();

extern bool EraseObject(uint32_t id);

template <typename T>
T FindObject(uint32_t id) {
  std::any wrapper_object;
  bool flag = global_data_holder.Find(
      id,
      wrapper_object);
  FOOTSTONE_CHECK(flag);
  return std::any_cast<T>(wrapper_object);
}

}
}

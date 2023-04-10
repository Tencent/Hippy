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

#include <footstone/logging.h>
#include "data_holder.h"

namespace voltron {
inline namespace ffi {

std::atomic<uint32_t> global_data_holder_key{1};
footstone::utils::PersistentObjectMap<uint32_t, std::any> global_data_holder;

uint32_t InsertObject(const std::any& obj) {
  auto id = voltron::global_data_holder_key.fetch_add(1);
  global_data_holder.Insert(id, obj);
  return id;
}

extern uint32_t GenId() {
  auto id = voltron::global_data_holder_key.fetch_add(1);
  return id;
}

void InsertObject(uint32_t id, const std::any& obj) {
  global_data_holder.Insert(id, obj);
}

bool EraseObject(uint32_t id) {
  return global_data_holder.Erase(id);
}



}
}

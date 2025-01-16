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

#include "oh_napi/data_holder.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace framework {
inline namespace ohnapi {

std::atomic<uint32_t> global_data_holder_key{1};
footstone::utils::PersistentObjectMap<uint32_t, std::any> global_data_holder;

footstone::utils::PersistentObjectMap<uint32_t, uint32_t> global_dom_manager_num_holder;
footstone::utils::PersistentObjectMap<uint32_t, uint32_t> global_dom_manager_current_id_holder;

uint32_t GlobalGetNextDomManagerId(uint32_t first_dom_manager_id) {
  uint32_t dom_manager_num = 0;
  auto flag = hippy::global_dom_manager_num_holder.Find(first_dom_manager_id, dom_manager_num);
  FOOTSTONE_CHECK(flag);
  if (dom_manager_num <= 1) {
    return first_dom_manager_id;
  }
  
  uint32_t current_dom_manager_id = 0;
  uint32_t next_id = 0;
  flag = hippy::global_dom_manager_current_id_holder.Find(first_dom_manager_id, current_dom_manager_id);
  if (flag) {
    next_id = current_dom_manager_id + 1;
    if (next_id >= (first_dom_manager_id + dom_manager_num)) {
      next_id = first_dom_manager_id;
    }
    hippy::global_dom_manager_current_id_holder.Erase(first_dom_manager_id);
    hippy::global_dom_manager_current_id_holder.Insert(first_dom_manager_id, next_id);
  } else {
    next_id = first_dom_manager_id;
    hippy::global_dom_manager_current_id_holder.Insert(first_dom_manager_id, next_id);
  }
  return next_id;
}

}
}
}

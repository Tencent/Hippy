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
#include "module/request/domain_base_request.h"

namespace hippy::devtools {
/**
 * @brief get CSS node model request
 */
class CSSNodeDataRequest : public Deserializer {
 public:
  CSSNodeDataRequest() : has_set_node_id_(false) {}
  void Deserialize(const std::string& params) override;

  int32_t GetNodeId() const { return node_id_; }
  bool HasSetNodeId() const { return has_set_node_id_; }

 private:
  int32_t node_id_;
  bool has_set_node_id_;
};
}  // namespace hippy::devtools

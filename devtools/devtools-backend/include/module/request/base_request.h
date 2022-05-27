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
#include "module/request/deserializer.h"
#include "nlohmann/json.hpp"

namespace hippy::devtools {

/**
 * @brief Parsing JSON sent from the front end_ Request data of type string
 */
class BaseRequest : public Deserializer {
 public:
  /**
   * parse json string to current member object
   * @param params json format data
   */
  void Deserialize(const std::string& params) override {}

  inline void SetId(int32_t id) { id_ = id; }
  inline int32_t GetId() const { return id_; }
  inline void SetAlreadySetValue(bool has_already_set_value) { has_already_set_value_ = has_already_set_value; }
  inline bool HasAlreadySetValue() const { return has_already_set_value_; }

 private:
  int32_t id_;
  bool has_already_set_value_ = false;
};
}  // namespace hippy::devtools

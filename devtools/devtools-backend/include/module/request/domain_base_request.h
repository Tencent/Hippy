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
#include "nlohmann/json.hpp"

namespace hippy::devtools {

/**
 * @brief Parsing JSON sent from the front end_ Request data of type string
 */
class Deserializer {
 public:
  /**
   * parse json string to current member object
   * @param params json format data
   */
  virtual void Deserialize(const std::string& params);

  void SetId(int32_t id) { id_ = id; }
  int32_t GetId() const { return id_; }

 private:
  int32_t id_;  // 请求带有的唯一标识符
};

}  // namespace hippy::devtools

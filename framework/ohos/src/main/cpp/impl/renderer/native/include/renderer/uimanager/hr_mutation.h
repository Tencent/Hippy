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

#include <string>
#include "dom/root_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

enum class HRMutationType {
  CREATE = 1,
  UPDATE = 2,
  MOVE = 3,
  MOVE2 = 4,
  DELETE = 5,
  UPDATE_LAYOUT = 6,
  UPDATE_EVENT_LISTENER = 7,
  TEXT_ELLIPSIZED_EVENT = 8,
};

class HRMutation {
public:
  HRMutation(HRMutationType type) : type_(type) {}
  virtual ~HRMutation() = default;
  
  HRMutationType type_;
};

class HRCreateMutation : public HRMutation {
public:
  HRCreateMutation() : HRMutation(HRMutationType::CREATE) {}
  
  std::string view_name_;
  uint32_t tag_ = 0;
  uint32_t parent_tag_ = 0;
  int32_t index_ = -1;
  footstone::value::HippyValue::HippyValueObjectType props_;
  bool is_parent_text_ = false;
};

class HRUpdateMutation : public HRMutation {
public:
  HRUpdateMutation() : HRMutation(HRMutationType::UPDATE) {}

  std::string view_name_;
  uint32_t tag_ = 0;
  uint32_t parent_tag_ = 0;
  int32_t index_ = -1;
  footstone::value::HippyValue::HippyValueObjectType props_;
  std::vector<std::string> delete_props_;
};

class HRMoveNodeInfo {
public:
  HRMoveNodeInfo(uint32_t tag, int32_t index) : tag_(tag), index_(index) {}
  
  uint32_t tag_ = 0;
  int32_t index_ = -1;
};

class HRMoveMutation : public HRMutation {
public:
  HRMoveMutation() : HRMutation(HRMutationType::MOVE) {}

  std::vector<HRMoveNodeInfo> node_infos_;
  uint32_t parent_tag_ = 0;
};

class HRMove2Mutation : public HRMutation {
public:
  HRMove2Mutation() : HRMutation(HRMutationType::MOVE2) {}
  
  std::vector<uint32_t> tags_;
  uint32_t to_parent_tag_ = 0;
  uint32_t from_parent_tag_ = 0;
  int32_t index_ = -1;
};

class HRDeleteMutation : public HRMutation {
public:
  HRDeleteMutation() : HRMutation(HRMutationType::DELETE) {}
  
  uint32_t tag_ = 0;
};

class HRUpdateLayoutMutation : public HRMutation {
public:
  HRUpdateLayoutMutation() : HRMutation(HRMutationType::UPDATE_LAYOUT) {}

  uint32_t tag_ = 0;
  float left_ = 0;
  float top_ = 0;
  float width_ = 0;
  float height_ = 0;
  float padding_left_ = 0;
  float padding_top_ = 0;
  float padding_right_ = 0;
  float padding_bottom_ = 0;
};

class HRUpdateEventListenerMutation : public HRMutation {
public:
  HRUpdateEventListenerMutation() : HRMutation(HRMutationType::UPDATE_EVENT_LISTENER) {}

  uint32_t tag_ = 0;
  footstone::value::HippyValue::HippyValueObjectType props_;
};

class HRTextEllipsizedEventMutation : public HRMutation {
public:
  HRTextEllipsizedEventMutation() : HRMutation(HRMutationType::TEXT_ELLIPSIZED_EVENT) {}

  uint32_t tag_ = 0;
};

using HRMutationVectorType = typename std::vector<std::shared_ptr<HRMutation>>;

} // namespace native
} // namespace render
} // namespace hippy

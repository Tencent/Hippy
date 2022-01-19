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

#include "render/render_task.h"

#include <utility>
#include "standard_message_codec.h"

namespace voltron {

RenderTask::RenderTask(VoltronRenderOpType type, int32_t node_id) : type_(type), node_id_(node_id) {}

RenderTask::RenderTask(VoltronRenderOpType type, int32_t node_id, EncodableMap args)
    : type_(type), node_id_(node_id), args_(std::move(args)) {}

EncodableValue RenderTask::Encode() {
  auto encode_task = EncodableList();
  encode_task.emplace_back(type_);
  encode_task.emplace_back(node_id_);
  if (!args_.empty()) {
    encode_task.emplace_back(std::move(args_));
  }
  return EncodableValue(std::move(encode_task));
}

}  // namespace voltron

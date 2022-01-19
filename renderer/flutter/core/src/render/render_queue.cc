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

#include "render/render_queue.h"
#include "standard_message_codec.h"

namespace voltron {

std::unique_ptr<std::vector<uint8_t>> VoltronRenderQueue::ConsumeRenderOp() {
  auto op_list = EncodableList();
  if (!queue_.empty()) {
    for (const auto &task : queue_) {
      op_list.push_back(task->Encode());
    }
    queue_.clear();
  }

  if (op_list.empty()) {
    return nullptr;
  }
  return std::move(StandardMessageCodec::GetInstance().EncodeMessage(
      EncodableValue(op_list)));
}

VoltronRenderQueue::~VoltronRenderQueue() { queue_.clear(); }

void VoltronRenderQueue::ProduceRenderOp(const Sp<RenderTask> &task) {
  queue_.push_back(task);
}

} // namespace voltron

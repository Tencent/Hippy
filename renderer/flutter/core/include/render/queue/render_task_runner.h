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

#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "render_queue.h"

namespace voltron {

class VoltronRenderTaskRunner {
public:
  using DomArgument = hippy::DomArgument;
  using DomManager = hippy::DomManager;
  using DomNode = hippy::DomNode;
  using DomValue = tdf::base::DomValue;
  using DomEvent = hippy::DomEvent;
  using LayoutSize = hippy::LayoutSize;
  using LayoutMeasureMode = hippy::LayoutMeasureMode;

  explicit VoltronRenderTaskRunner(int32_t engine_id, int32_t root_id);
  virtual ~VoltronRenderTaskRunner();
  void RunCreateDomNode(const Sp<DomNode> &node);
  void RunDeleteDomNode(const Sp<DomNode> &node);
  void RunUpdateDomNode(const Sp<DomNode> &node);
  void RunUpdateLayout(const SpList<DomNode> &nodes);
  void RunMoveDomNode(std::vector<int32_t> &&ids, int32_t pid, int32_t id);
  void RunBatch();
  void RunLayoutBefore();
  void RunLayoutFinish();
  void RunCallFunction(const std::weak_ptr<DomNode> &dom_node,
                       const std::string &name, const DomArgument &param,
                       uint32_t cb_id);
  static void RunCallEvent(const std::weak_ptr<DomNode> &dom_node,
                    const std::string &name,
                    const std::unique_ptr<EncodableValue> &params);
  void RunAddEventListener(const int32_t &node_id, const String &event_name);
  void RunRemoveEventListener(const int32_t &node_id, const String &event_name);
  Sp<DomManager> GetDomManager() const;

private:
  void ConsumeQueue();
  static EncodableValue DecodeDomValueMap(const SpMap<DomValue> &value_map);
  static EncodableValue DecodeDomValue(const DomValue &value);
  static DomValue EncodeDomValue(const EncodableValue &value);
  void SetNodeCustomMeasure(const Sp<DomNode> &dom_node) const;
  Sp<VoltronRenderQueue> queue_;

  int32_t engine_id_;
  int32_t root_id_;
};

} // namespace voltron

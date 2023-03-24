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
  using HippyValue = footstone::value::HippyValue;
  using DomEvent = hippy::DomEvent;
  using LayoutSize = hippy::LayoutSize;
  using LayoutMeasureMode = hippy::LayoutMeasureMode;

  explicit VoltronRenderTaskRunner(uint32_t id);
  virtual ~VoltronRenderTaskRunner();
  void RunCreateDomNode(uint32_t root_id, const Sp<DomNode> &node);
  void RunDeleteDomNode(uint32_t root_id, const Sp<DomNode> &node);
  void RunUpdateDomNode(uint32_t root_id, const Sp<DomNode> &node);
  void RunUpdateLayout(uint32_t root_id, const SpList<DomNode> &nodes);
  void RunRecombineDomNode(uint32_t root_id, std::vector<int32_t> &&move_ids, int32_t from_pid, int32_t to_pid, int32_t index);
  void RunMoveDomNode(uint32_t root_id, const Sp<DomNode> &node);
  void RunBatch(uint32_t root_id);
  void RunLayoutBefore(uint32_t root_id);
  void RunLayoutFinish(uint32_t root_id);
  void RunCallFunction(uint32_t root_id, const std::weak_ptr<DomNode> &dom_node,
                       const std::string &name, const DomArgument &param,
                       uint32_t cb_id);
  static void RunCallEvent(const std::weak_ptr<DomNode> &dom_node,
                    const std::string &name, bool capture, bool bubble,
                    const std::unique_ptr<EncodableValue> &params);

  void RunAddEventListener(uint32_t root_id, const uint32_t &node_id, const String &event_name);
  void RunRemoveEventListener(uint32_t root_id, const uint32_t &node_id, const String &event_name);

  void SetDomManager(const Sp<DomManager>& dom_manager);
  Sp<DomManager> GetDomManager();

  uint32_t GetId() { return render_manager_id_; }
  void BindBridgeId(int32_t bridge_id) { engine_id_ = bridge_id; }

 private:
  void ConsumeQueue(uint32_t root_id);
  static EncodableValue DecodeDomValueMap(const SpMap<HippyValue> &value_map);
  static EncodableValue DecodeDomValue(const HippyValue &value);
  static HippyValue EncodeDomValue(const EncodableValue &value);
  void SetNodeCustomMeasure(uint32_t root_id, const Sp<DomNode> &dom_node) const;
  Sp<VoltronRenderQueue> queue(uint32_t root_id);
  std::map<uint32_t, Sp<VoltronRenderQueue>> queue_map_;

  uint32_t render_manager_id_;
  int32_t engine_id_;
  std::weak_ptr<DomManager> dom_manager_;
};

} // namespace voltron

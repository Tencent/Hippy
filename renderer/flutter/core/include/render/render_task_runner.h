#pragma once

#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "render/render_queue.h"

namespace voltron {

using hippy::DispatchFunctionCallback;
using hippy::DomNode;
using tdf::base::DomValue;

class VoltronRenderTaskRunner {
 public:
  VoltronRenderTaskRunner();
  virtual ~VoltronRenderTaskRunner();
  void RunCreateDomNode(const Sp<DomNode>& node);
  void RunDeleteDomNode(const Sp<DomNode>& node);
  void RunUpdateDomNode(const Sp<DomNode>& node);
  void RunMoveDomNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id);
  void RunBatch();
  std::unique_ptr<std::vector<uint8_t>> ConsumeQueue();
 private:
  EncodableValue EncodeDomValueMap(const SpMap<DomValue>& value_map);
  std::unique_ptr<EncodableValue> ParseDomValue(const DomValue& value);
  Sp<VoltronRenderQueue> queue_;
};

}  // namespace voltron

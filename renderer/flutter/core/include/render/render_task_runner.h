#pragma once

#include "dom/dom_node.h"
#include "render/render_queue.h"

namespace voltron {

using hippy::DomNode;
using tdf::base::DomValue;

class VoltronRenderTaskRunner {
 public:
  VoltronRenderTaskRunner();
  virtual ~VoltronRenderTaskRunner();
  void RunCreateDomNode(const Sp<DomNode>& node);
  void RunDeleteDomNode(const Sp<DomNode>& node);

 private:
  EncodableValue EncodeDomValueMap(const SpMap<DomValue>& value_map);
  std::unique_ptr<EncodableValue> ParseDomValue(const DomValue& value);
  Sp<VoltronRenderQueue> queue_;
};

}  // namespace voltron

#pragma once

#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "render/render_queue.h"

namespace voltron {

using hippy::CallFunctionCallback;
using hippy::DomManager;
using hippy::DomNode;
using tdf::base::DomValue;

class VoltronRenderTaskRunner {
 public:
  explicit VoltronRenderTaskRunner(int32_t engine_id, int32_t root_id);
  virtual ~VoltronRenderTaskRunner();
  void RunCreateDomNode(const Sp<DomNode>& node);
  void RunDeleteDomNode(const Sp<DomNode>& node);
  void RunUpdateDomNode(const Sp<DomNode>& node);
  void RunUpdateLayout(const SpList<DomNode>& nodes);
  void RunMoveDomNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id);
  void RunBatch();
  void RunLayoutBefore();
  void RunLayoutFinish();
  void RunCallFunction(const std::weak_ptr<DomNode>& dom_node, const std::string& name, const DomValue& param,
                       const CallFunctionCallback& cb);
  void RunCallEvent(const std::weak_ptr<DomNode>& dom_node, const std::string& name,
                    const std::unique_ptr<EncodableValue>& params);
  void RunAddEventListener(const int32_t& node_id, const String& event_name);
  void RunRemoveEventListener(const int32_t& node_id, const String& event_name);

  Sp<DomNode> GetDomNode(int32_t root_id, int32_t node_id) const;

 private:
  void ConsumeQueue();
  static EncodableValue DecodeDomValueMap(const SpMap<DomValue>& value_map);
  static EncodableValue DecodeDomValue(const DomValue& value);
  static DomValue EncodeDomValue(const EncodableValue& value);
  Sp<VoltronRenderQueue> queue_;

  int32_t engine_id_;
  int32_t root_id_;
};

}  // namespace voltron

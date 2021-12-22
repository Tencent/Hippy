#pragma once

#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "render/render_queue.h"

namespace voltron {

using hippy::CallFunctionCallback;
using hippy::DomNode;
using hippy::DomManager;
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
  void RunCallFunction(const std::weak_ptr<DomNode>& dom_node, const std::string& name,
                       const std::unordered_map<std::string, std::shared_ptr<DomValue>>& param,
                       const CallFunctionCallback& cb);
  void RunAddEventListener(const int32_t& node_id, const String& event_name, const EncodableMap& params,
                           const std::function<void(const EncodableValue& params)>& cb);
  void RunRemoveEventListener(const int32_t& node_id, const String& event_name, const EncodableMap& params);

  Sp<DomNode> GetDomNode(int32_t root_id, int32_t node_id) const;

 private:
  void ConsumeQueue();
  EncodableValue EncodeDomValueMap(const SpMap<DomValue>& value_map);
  EncodableValue ParseDomValue(const DomValue& value);
  Sp<VoltronRenderQueue> queue_;

  int32_t engine_id_;
  int32_t root_id_;
};

}  // namespace voltron

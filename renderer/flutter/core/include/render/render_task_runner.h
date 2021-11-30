#pragma once

#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "render/render_queue.h"

namespace voltron {

using hippy::CallFunctionCallback;
using hippy::DispatchFunctionCallback;
using hippy::DomNode;
using tdf::base::DomValue;

class VoltronRenderTaskRunner {
 public:
  VoltronRenderTaskRunner(int32_t engine_id);
  virtual ~VoltronRenderTaskRunner();
  void RunCreateDomNode(const Sp<DomNode>& node);
  void RunDeleteDomNode(const Sp<DomNode>& node);
  void RunUpdateDomNode(const Sp<DomNode>& node);
  void RunMoveDomNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id);
  void RunBatch();
  void RunCallFunction(const std::weak_ptr<DomNode>& dom_node, const std::string& name,
                       const std::unordered_map<std::string, std::shared_ptr<DomValue>>& param,
                       const DispatchFunctionCallback& cb);
  void RunAddEventListener(const int32_t& node_id, const String& event_name, const EncodableMap& params,
                           const std::function<void(const int32_t&, const String&, const std::any& params)>& cb);
  std::unique_ptr<std::vector<uint8_t>> ConsumeQueue();

 private:
  String GenEventCallKey(int32_t node_id, const String& event_name);
  bool HasEventCall(int32_t node_id, const String& event_name, const String& call_id);

  EncodableValue EncodeDomValueMap(const SpMap<DomValue>& value_map);
  std::unique_ptr<EncodableValue> ParseDomValue(const DomValue& value);
  Sp<VoltronRenderQueue> queue_;
  Map<String, List<String>> callback_id_map_;

  int32_t engine_id_;
};

}  // namespace voltron

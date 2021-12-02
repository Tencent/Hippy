#include "render/render_task_runner.h"
#include "bridge/bridge_manager.h"
#include "encodable_value.h"
#include "render/const.h"

namespace voltron {

VoltronRenderTaskRunner::~VoltronRenderTaskRunner() { queue_ = nullptr; }

VoltronRenderTaskRunner::VoltronRenderTaskRunner(int32_t engine_id) : engine_id_(engine_id) {
  queue_ = std::make_shared<VoltronRenderQueue>();
}

void VoltronRenderTaskRunner::RunCreateDomNode(const Sp<DomNode>& node) {
  auto args_map = EncodableMap();
  args_map[EncodableValue(kChildIndexKey)] = EncodableValue(node->GetIndex());
  args_map[EncodableValue(kClassNameKey)] = EncodableValue(node->GetViewName());
  args_map[EncodableValue(kParentNodeIdKey)] = EncodableValue(node->GetPid());
  if (!node->GetStyleMap().empty()) {
    args_map[EncodableValue(kStylesKey)] = EncodeDomValueMap(node->GetStyleMap());
  }
  if (!node->GetExtStyle().empty()) {
    args_map[EncodableValue(kPropsKey)] = EncodeDomValueMap(node->GetExtStyle());
  }

  auto args = std::make_unique<EncodableValue>(args_map);
  auto create_task = std::make_shared<RenderTask>(VoltronRenderOpType::ADD_NODE, node->GetId(), std::move(args));
  queue_->ProduceRenderOp(create_task);
}

void VoltronRenderTaskRunner::RunDeleteDomNode(const Sp<DomNode>& node) {
  auto delete_task = std::make_shared<RenderTask>(VoltronRenderOpType::DELETE_NODE, node->GetId());
  queue_->ProduceRenderOp(delete_task);
}

void VoltronRenderTaskRunner::RunUpdateDomNode(const Sp<DomNode>& node) {
  auto args_map = EncodableMap();
  if (!node->GetDiffStyle().empty()) {
    args_map[EncodableValue(kPropsKey)] = EncodeDomValueMap(node->GetDiffStyle());
    auto args = std::make_unique<EncodableValue>(args_map);
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::UPDATE_NODE, node->GetId(), std::move(args));
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunUpdateLayout(const SpList<DomNode>& nodes) {
  if (!nodes.empty()) {
    auto args_map = EncodableMap();
    auto render_node_list = EncodableList();

    for (const auto& node : nodes) {
      node->LayoutR();
    }
    if (!node->GetDiffStyle().empty()) {
      args_map[EncodableValue(kPropsKey)] = EncodeDomValueMap(node->GetDiffStyle());
      auto args = std::make_unique<EncodableValue>(args_map);
      auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::UPDATE_LAYOUT, node->GetId(), std::move(args));
      queue_->ProduceRenderOp(update_task);
    }
  }
}

void VoltronRenderTaskRunner::RunMoveDomNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) {
  auto args_map = EncodableMap();
  if (!ids.empty()) {
    auto id_list = EncodableList();
    for (const auto& item_id : ids) {
      id_list.emplace_back(item_id);
    }
    args_map[EncodableValue(kMoveIdListKey)] = id_list;
  }
  args_map[EncodableValue(kMovePidKey)] = EncodableValue(pid);
  auto args = std::make_unique<EncodableValue>(args_map);
  auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::MOVE_NODE, id, std::move(args));
  queue_->ProduceRenderOp(update_task);
}

void VoltronRenderTaskRunner::RunBatch() {
  auto batch_task = std::make_shared<RenderTask>(VoltronRenderOpType::BATCH, 0);
  queue_->ProduceRenderOp(batch_task);
}

std::unique_ptr<EncodableValue> VoltronRenderTaskRunner::ParseDomValue(const DomValue& value) {
  if (value.IsBoolean()) {
    return std::make_unique<EncodableValue>(value.ToBoolean());
  } else if (value.IsInt32()) {
    return std::make_unique<EncodableValue>(value.ToInt32());
  } else if (value.IsInt64()) {
    return std::make_unique<EncodableValue>(value.ToInt64());
  } else if (value.IsUInt32()) {
    return std::make_unique<EncodableValue>(static_cast<int64_t>(value.ToUint32()));
  } else if (value.IsUInt64()) {
    return std::make_unique<EncodableValue>(static_cast<int64_t>(value.ToUint64()));
  } else if (value.IsDouble()) {
    return std::make_unique<EncodableValue>(value.ToDouble());
  } else if (value.IsArray()) {
    auto parse_list = EncodableList();
    for (const auto& item : value.ToArray()) {
      auto parse_item_value = ParseDomValue(item);
      if (parse_item_value) {
        parse_list.emplace_back(*parse_item_value);
      }
    }
    return std::make_unique<EncodableValue>(parse_list);
  } else if (value.IsObject()) {
    auto parse_map = EncodableMap();
    for (const auto& entry : value.ToObject()) {
      auto encode_entry_value = ParseDomValue(entry.second);
      if (encode_entry_value) {
        auto encode_entry_key = EncodableValue(entry.first);
        parse_map[encode_entry_key] = *encode_entry_value;
      }
    }

    return std::make_unique<EncodableValue>(parse_map);
  } else {
    return nullptr;
  }
}

EncodableValue VoltronRenderTaskRunner::EncodeDomValueMap(const SpMap<DomValue>& value_map) {
  auto encode_map = EncodableMap();
  auto encode_value = EncodableValue(encode_map);

  for (const auto& entry : value_map) {
    auto encode_entry_value = ParseDomValue(*entry.second);
    if (encode_entry_value) {
      auto encode_entry_key = EncodableValue(entry.first);
      encode_map[encode_entry_key] = *encode_entry_value;
    }
  }

  return encode_value;
}

std::unique_ptr<std::vector<uint8_t>> VoltronRenderTaskRunner::ConsumeQueue() { return queue_->ConsumeRenderOp(); }

void VoltronRenderTaskRunner::RunCallFunction(const std::weak_ptr<DomNode>& dom_node, const std::string& name,
                                              const std::unordered_map<std::string, std::shared_ptr<DomValue>>& param,
                                              const DispatchFunctionCallback& cb) {
  auto node = dom_node.lock();
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (node && bridge_manager) {
    auto args_map = EncodableMap();
    args_map[EncodableValue(kFuncNameKey)] = EncodableValue(name);
    if (!param.empty()) {
      args_map[EncodableValue(kFuncParamsKey)] = EncodeDomValueMap(param);
    }
    auto callback_id = bridge_manager->AddNativeCallback(kCallUiFuncType, [dom_node, name](const std::any& params) {
      auto inner_node = dom_node.lock();
      if (inner_node) {
        auto callback = inner_node->GetCallback(name);
        if (callback) {
          callback(params);
        }
      }
    });
    args_map[EncodableValue(kFuncIdKey)] = EncodableValue(callback_id);
    auto args = std::make_unique<EncodableValue>(args_map);
    auto update_task =
        std::make_shared<RenderTask>(VoltronRenderOpType::DISPATCH_UI_FUNC, node->GetId(), std::move(args));
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunAddEventListener(const int32_t& node_id, const String& event_name,
                                                  const EncodableMap& params,
                                                  const std::function<void(const EncodableValue& params)>& cb) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (bridge_manager) {
    auto args_map = EncodableMap();
    if (!params.empty()) {
      args_map[EncodableValue(kFuncParamsKey)] = params;
    }
    args_map[EncodableValue(kFuncNameKey)] = event_name;

    auto callback_id =
        bridge_manager->AddNativeCallback(event_name, [cb](const EncodableValue& params) { cb(params); });
    args_map[EncodableValue(kFuncIdKey)] = callback_id;
    auto args = std::make_unique<EncodableValue>(args_map);
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::ADD_EVENT, node_id, std::move(args));
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunRemoveEventListener(const int32_t& node_id, const String& event_name,
                                                     const EncodableMap& params) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (bridge_manager) {
    auto args_map = EncodableMap();
    args_map[EncodableValue(kFuncNameKey)] = event_name;
    if (!params.empty()) {
      args_map[EncodableValue(kFuncParamsKey)] = params;
    }
    auto args = std::make_unique<EncodableValue>(args_map);
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::REMOVE_EVENT, node_id, std::move(args));
    queue_->ProduceRenderOp(update_task);
  }
}

Sp<DomNode> VoltronRenderTaskRunner::GetDomNode(int32_t root_id, int32_t node_id) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (dom_manager) {
      return dom_manager->GetNode(node_id);
    }
  }
  return nullptr;
}

}  // namespace voltron

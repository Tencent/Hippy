#include <memory>

#include "bridge/bridge_manager.h"
#include "encodable_value.h"
#include "ffi/bridge_define.h"
#include "ffi/callback_manager.h"
#include "render/const.h"
#include "render/render_task_runner.h"

namespace voltron {

using hippy::DomEvent;

VoltronRenderTaskRunner::~VoltronRenderTaskRunner() { queue_ = nullptr; }

VoltronRenderTaskRunner::VoltronRenderTaskRunner(int32_t engine_id, int32_t root_id)
    : engine_id_(engine_id), root_id_(root_id) {
  queue_ = std::make_shared<VoltronRenderQueue>();
}

void VoltronRenderTaskRunner::RunCreateDomNode(const Sp<DomNode>& node) {
  TDF_BASE_DLOG(INFO) << "RunCreateDomNode id" << node->GetId() << " pid" << node->GetPid()
                      << " parent addr:" << (int64_t)(node->GetParent().get());
  auto args_map = EncodableMap();
  auto render_info = node->GetRenderInfo();
  args_map[EncodableValue(kChildIndexKey)] = EncodableValue(render_info.index);
  args_map[EncodableValue(kClassNameKey)] = EncodableValue(node->GetViewName());
  args_map[EncodableValue(kParentNodeIdKey)] = EncodableValue(render_info.pid);
  if (!node->GetStyleMap().empty()) {
    args_map[EncodableValue(kStylesKey)] = DecodeDomValueMap(node->GetStyleMap());
  }
  if (!node->GetExtStyle().empty()) {
    args_map[EncodableValue(kPropsKey)] = DecodeDomValueMap(node->GetExtStyle());
  }

  auto create_task = std::make_shared<RenderTask>(VoltronRenderOpType::ADD_NODE, node->GetId(), args_map);
  queue_->ProduceRenderOp(create_task);
}

void VoltronRenderTaskRunner::RunDeleteDomNode(const Sp<DomNode>& node) {
  auto delete_task = std::make_shared<RenderTask>(VoltronRenderOpType::DELETE_NODE, node->GetId());
  queue_->ProduceRenderOp(delete_task);
}

void VoltronRenderTaskRunner::RunUpdateDomNode(const Sp<DomNode>& node) {
  auto args_map = EncodableMap();
  if (!node->GetDiffStyle().empty()) {
    args_map[EncodableValue(kPropsKey)] = DecodeDomValueMap(node->GetDiffStyle());
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::UPDATE_NODE, node->GetId(), args_map);
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunUpdateLayout(const SpList<DomNode>& nodes) {
  if (!nodes.empty()) {
    auto args_map = EncodableMap();
    auto render_node_list = EncodableList();

    for (const auto& node : nodes) {
      TDF_BASE_DLOG(INFO) << "RunUpdateLayout id" << node->GetId();
      auto layout_node = node->GetLayoutNode();
      if (layout_node) {
        auto node_layout_prop_list = EncodableList();
        node_layout_prop_list.emplace_back(node->GetId());
        // x
        node_layout_prop_list.emplace_back(layout_node->GetLeft());
        // y
        node_layout_prop_list.emplace_back(layout_node->GetTop());
        // w
        node_layout_prop_list.emplace_back(layout_node->GetWidth());
        // h
        node_layout_prop_list.emplace_back(layout_node->GetHeight());
        render_node_list.emplace_back(std::move(node_layout_prop_list));
      }
    }
    if (!render_node_list.empty()) {
      args_map[EncodableValue(kLayoutNodesKey)] = EncodableValue(std::move(render_node_list));
      auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::UPDATE_LAYOUT, 0, args_map);
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
  auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::MOVE_NODE, id, args_map);
  queue_->ProduceRenderOp(update_task);
}

void VoltronRenderTaskRunner::RunBatch() {
  auto batch_task = std::make_shared<RenderTask>(VoltronRenderOpType::BATCH, 0);
  queue_->ProduceRenderOp(batch_task);
  ConsumeQueue();
}

void VoltronRenderTaskRunner::RunLayoutBefore() {
  auto batch_task = std::make_shared<RenderTask>(VoltronRenderOpType::LAYOUT_BEFORE, 0);
  queue_->ProduceRenderOp(batch_task);
  ConsumeQueue();
}

void VoltronRenderTaskRunner::RunLayoutFinish() {
  auto batch_task = std::make_shared<RenderTask>(VoltronRenderOpType::LAYOUT_FINISH, 0);
  queue_->ProduceRenderOp(batch_task);
}

EncodableValue VoltronRenderTaskRunner::DecodeDomValue(const DomValue& value) {
  if (value.IsBoolean()) {
    return EncodableValue(value.ToBoolean());
  } else if (value.IsInt32()) {
    return EncodableValue(value.ToInt32());
  } else if (value.IsUInt32()) {
    return EncodableValue(static_cast<int64_t>(value.ToUint32()));
  } else if (value.IsDouble()) {
    return EncodableValue(value.ToDouble());
  } else if (value.IsString()) {
    return EncodableValue(value.ToString());
  } else if (value.IsArray()) {
    auto parse_list = EncodableList();
    for (const auto& item : value.ToArray()) {
      auto parse_item_value = DecodeDomValue(item);
      if (!parse_item_value.IsNull()) {
        parse_list.emplace_back(parse_item_value);
      }
    }
    return EncodableValue(std::move(parse_list));
  } else if (value.IsObject()) {
    auto parse_map = EncodableMap();
    for (const auto& entry : value.ToObject()) {
      auto encode_entry_value = DecodeDomValue(entry.second);
      if (!encode_entry_value.IsNull()) {
        auto encode_entry_key = EncodableValue(entry.first);
        parse_map[encode_entry_key] = encode_entry_value;
      }
    }

    return EncodableValue(std::move(parse_map));
  } else {
    return EncodableValue(std::monostate{});
  }
}

DomValue VoltronRenderTaskRunner::EncodeDomValue(const EncodableValue& value) {
  auto bool_value = std::get_if<bool>(&value);
  if (bool_value) {
    return DomValue(*bool_value);
  }

  auto int_value = std::get_if<int32_t>(&value);
  if (int_value) {
    return DomValue(*int_value);
  }

  auto long_value = std::get_if<int64_t>(&value);
  if (long_value) {
    return DomValue(static_cast<int32_t>(*long_value));
  }

  auto double_value = std::get_if<double>(&value);
  if (double_value) {
    return DomValue(*double_value);
  }

  auto string_value = std::get_if<std::string>(&value);
  if (string_value) {
    return DomValue(*string_value);
  }

  auto list_value = std::get_if<EncodableList>(&value);
  if (list_value) {
    std::vector<DomValue> parse_list;
    for (const auto& item : *list_value) {
      auto parse_item_value = EncodeDomValue(item);
      if (!parse_item_value.IsNull()) {
        parse_list.emplace_back(parse_item_value);
      }
    }
    return DomValue(std::move(parse_list));
  }

  auto map_value = std::get_if<EncodableMap>(&value);
  if (map_value) {
    std::unordered_map<std::string, DomValue> parse_map;
    for (const auto& entry : *map_value) {
      auto key = std::get_if<std::string>(&entry.first);
      if (key) {
        auto encode_entry_value = EncodeDomValue(entry.second);
        if (!encode_entry_value.IsNull()) {
          parse_map[*key] = encode_entry_value;
        }
      }
    }

    if (!parse_map.empty()) {
      return DomValue(std::move(parse_map));
    }
  }
  return DomValue::Null();
}

EncodableValue VoltronRenderTaskRunner::DecodeDomValueMap(const SpMap<DomValue>& value_map) {
  auto encode_map = EncodableMap();

  for (const auto& entry : value_map) {
    auto encode_entry_value = DecodeDomValue(*entry.second);
    if (!encode_entry_value.IsNull()) {
      auto encode_entry_key = EncodableValue(entry.first);
      encode_map[encode_entry_key] = std::move(encode_entry_value);
    }
  }

  return EncodableValue(std::move(encode_map));
}

void VoltronRenderTaskRunner::ConsumeQueue() {
  if (post_render_op_func) {
    auto render_op_buffer = queue_->ConsumeRenderOp().release();
    if (render_op_buffer) {
      auto engine_id = engine_id_;
      auto root_id = root_id_;
      const Work work = [engine_id, root_id, render_op_buffer]() {
        auto op_buffer = std::unique_ptr<std::vector<uint8_t>>(render_op_buffer);
        auto buffer_length = static_cast<int64_t>(op_buffer->size());
        if (buffer_length > 0) {
          auto ptr = reinterpret_cast<const void*>(op_buffer->data());
          post_render_op_func(engine_id, root_id, ptr, buffer_length);
        }
      };
      const Work* work_ptr = new Work(work);
      PostWorkToDart(work_ptr);
    }
  }
}

void VoltronRenderTaskRunner::RunCallFunction(const std::weak_ptr<DomNode>& dom_node, const std::string& name,
                                              const DomValue& param, const hippy::CallFunctionCallback& cb) {
  auto node = dom_node.lock();
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (node && bridge_manager) {
    auto args_map = EncodableMap();
    args_map[EncodableValue(kFuncNameKey)] = EncodableValue(name);
    if (!param.IsNull() || !param.IsUndefined()) {
      args_map[EncodableValue(kFuncParamsKey)] = DecodeDomValue(param);
    }
    auto callback_id =
        bridge_manager->AddNativeCallback(kCallUiFuncType, [dom_node, name](const EncodableValue& params) {
          auto inner_node = dom_node.lock();
          if (inner_node) {
            auto callback = inner_node->GetCallback(name);
            auto encode_params = EncodeDomValue(params);
            if (callback) {
              callback(encode_params);
            }
          }
        });
    args_map[EncodableValue(kFuncIdKey)] = EncodableValue(callback_id);
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::DISPATCH_UI_FUNC, node->GetId(), args_map);
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunCallEvent(const std::weak_ptr<DomNode>& dom_node, const std::string& name,
                                           const std::unique_ptr<EncodableValue>& params) {
  auto node = dom_node.lock();
  if (node && !name.empty()) {
    if (params) {
      auto encode_params = EncodeDomValue(*params);
      if (!encode_params.IsNull()) {
        node->HandleEvent(std::make_shared<DomEvent>(name, dom_node, std::make_shared<DomValue>(encode_params)));
        return;
      }
    }

    node->HandleEvent(std::make_shared<DomEvent>(name, dom_node));
  }
}

void VoltronRenderTaskRunner::RunAddEventListener(const int32_t& node_id, const String& event_name) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (bridge_manager) {
    auto args_map = EncodableMap();
    args_map[EncodableValue(kFuncNameKey)] = event_name;

    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::ADD_EVENT, node_id, args_map);
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunRemoveEventListener(const int32_t& node_id, const String& event_name) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id_);
  if (bridge_manager) {
    auto args_map = EncodableMap();
    args_map[EncodableValue(kFuncNameKey)] = event_name;
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::REMOVE_EVENT, node_id, args_map);
    queue_->ProduceRenderOp(update_task);
  }
}

Sp<DomNode> VoltronRenderTaskRunner::GetDomNode(int32_t root_id, int32_t node_id) const {
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

#include "render/render_task_runner.h"
#include "encodable_value.h"
#include "render/const.h"

namespace voltron {

VoltronRenderTaskRunner::~VoltronRenderTaskRunner() {
  queue_ = std::make_shared<VoltronRenderQueue>();
}

VoltronRenderTaskRunner::VoltronRenderTaskRunner() {
  queue_ = nullptr;
}

void VoltronRenderTaskRunner::RunCreateDomNode(const Sp<DomNode>& node) {
  auto argsMap = EncodableMap();
  argsMap[EncodableValue(kChildIndexKey)] = EncodableValue(node->GetIndex());
  argsMap[EncodableValue(kClassNameKey)] = EncodableValue(node->GetViewName());
  argsMap[EncodableValue(kParentNodeIdKey)] = EncodableValue(node->GetPid());
  if (!node->GetStyleMap().empty()) {
    argsMap[EncodableValue(kStylesKey)] = EncodeDomValueMap(node->GetStyleMap());
  }
  if (!node->GetPropMap().empty()) {
    argsMap[EncodableValue(kPropsKey)] = EncodeDomValueMap(node->GetPropMap());
  }

  auto args = std::make_unique<EncodableValue>(argsMap);
  auto create_task = std::make_shared<RenderTask>(VoltronRenderOpType::ADD_NODE, node->GetId(), std::move(args));
  queue_->ProduceRenderOp(create_task);
}

void VoltronRenderTaskRunner::RunDeleteDomNode(const Sp<DomNode>& node) {
  auto delete_task = std::make_shared<RenderTask>(VoltronRenderOpType::DELETE_NODE, node->GetId());
  queue_->ProduceRenderOp(delete_task);
}

void VoltronRenderTaskRunner::RunUpdateDomNode(const Sp<DomNode>& node) {
  auto argsMap = EncodableMap();
  if (!node->GetDiffMap().empty()) {
    argsMap[EncodableValue(kPropsKey)] = EncodeDomValueMap(node->GetDiffMap());
    auto args = std::make_unique<EncodableValue>(argsMap);
    auto update_task = std::make_shared<RenderTask>(VoltronRenderOpType::ADD_NODE, node->GetId(), std::move(args));
    queue_->ProduceRenderOp(update_task);
  }
}

void VoltronRenderTaskRunner::RunMoveDomNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) {
  auto argsMap = EncodableMap();
  if (!ids.empty()) {
    auto id_list = EncodableList();
    for (const auto& item_id : ids) {
      id_list.emplace_back(item_id);
    }
    argsMap[EncodableValue(kMoveIdListKey)] = id_list;
  }
  argsMap[EncodableValue(kMovePidKey)] = EncodableValue(pid);
  auto args = std::make_unique<EncodableValue>(argsMap);
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

}  // namespace voltron

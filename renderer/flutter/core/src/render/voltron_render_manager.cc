#include <variant>

#include "render/const.h"
#include "render/voltron_render_manager.h"

namespace voltron {

using hippy::TouchEventInfo;

VoltronRenderManager::VoltronRenderManager(int32_t root_id, int32_t engine_id)
    : VoltronRenderTaskRunner(engine_id), root_id_(root_id) {}

VoltronRenderManager::~VoltronRenderManager() = default;

void voltron::VoltronRenderManager::CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& node : nodes) {
    RunCreateDomNode(node);
  }
}

void VoltronRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& node : nodes) {
    RunUpdateDomNode(node);
  }
}

void VoltronRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& node : nodes) {
    RunDeleteDomNode(node);
  }
}

void VoltronRenderManager::MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) {
  RunMoveDomNode(std::move(ids), pid, id);
}

void VoltronRenderManager::UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) {
  RunUpdateLayout(nodes);
}

void VoltronRenderManager::Batch() { RunBatch(); }

void VoltronRenderManager::RemoveTouchEventListener(int32_t id, TouchEvent event) {
  auto params = EncodableMap();
  params[EncodableValue(kTouchTypeKey)] = EncodableValue(static_cast<int>(event));
  RunRemoveEventListener(id, kRemoveTouchFuncType, params);
}

void VoltronRenderManager::RemoveClickEventListener(int32_t id) {
  RunRemoveEventListener(id, kRemoveClickFuncType, {});
}

void VoltronRenderManager::CallFunction(std::weak_ptr<DomNode> domNode, const std::string& name,
                                        std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                                        DispatchFunctionCallback cb) {
  RunCallFunction(domNode, name, param, cb);
}

void VoltronRenderManager::SetClickEventListener(int32_t id, OnClickEventListener listener) {
  RunAddEventListener(id, kAddClickFuncType, {}, [id, this](const std::any& params) {
    auto node = GetDomNode(root_id_, id);
    if (node) {
//      node->CallClick();
    }
  });
}

void VoltronRenderManager::SetLongClickEventListener(int32_t id, OnLongClickEventListener listener) {
  RunAddEventListener(id, kAddLongClickFuncType, {}, [id, this](const std::any& params) {
    auto node = GetDomNode(root_id_, id);
    if (node) {
//      node->CallLongClick();
    }
  });
}

void VoltronRenderManager::RemoveLongClickEventListener(int32_t id) {
  RunRemoveEventListener(id, kRemoveLongClickFuncType, {});
}

void VoltronRenderManager::SetTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) {
  auto params = EncodableMap();
  params[EncodableValue(kTouchTypeKey)] = EncodableValue(static_cast<int32_t>(event));
  RunAddEventListener(id, kAddTouchFuncType, params, [id, this](const EncodableValue& params) {
    auto node = GetDomNode(root_id_, id);
    if (node) {
      if (auto params_map = std::get_if<EncodableMap>(&params)) {
        auto touch_type_iter = params_map->find(EncodableValue(kTouchTypeKey));
        auto touch_x_iter = params_map->find(EncodableValue(kTouchX));
        auto touch_y_iter = params_map->find(EncodableValue(kTouchY));

        if (touch_type_iter != params_map->end()) {
          auto touch_type_ptr = std::get_if<int>(&(touch_type_iter->second));
          if (touch_type_ptr) {
            TouchEventInfo touch_info{};
            touch_info.x = 0;
            touch_info.y = 0;
            int touch_type_int = *touch_type_ptr;
            if (touch_type_int >= static_cast<int>(TouchEvent::Start) &&
                touch_type_int <= static_cast<int>(TouchEvent::Cancel)) {
              auto touch_type = TouchEvent(touch_type_int);
              if (touch_x_iter != params_map->end()) {
                auto touch_x_ptr = std::get_if<double>(&(touch_x_iter->second));
                if (touch_x_ptr) {
                  touch_info.x = static_cast<float>(*touch_x_ptr);
                }
              }
              if (touch_y_iter != params_map->end()) {
                auto touch_y_ptr = std::get_if<double>(&(touch_y_iter->second));
                if (touch_y_ptr) {
                  touch_info.y = static_cast<float>(*touch_y_ptr);
                }
              }
//              node->CallTouch(touch_type, touch_info);
            }
          }
        }
      }
    }
  });
}

void VoltronRenderManager::SetShowEventListener(int32_t id, ShowEvent event, OnShowEventListener listener) {
  auto params = EncodableMap();
  params[EncodableValue(kShowEventKey)] = EncodableValue(static_cast<int32_t>(event));
  RunAddEventListener(id, kAddShowFuncType, params, [id, this](const EncodableValue& params) {
    auto node = GetDomNode(root_id_, id);
    if (node) {
      if (auto params_map = std::get_if<EncodableMap>(&params)) {
        auto show_type_iter = params_map->find(EncodableValue(kShowEventKey));

        if (show_type_iter != params_map->end()) {
          auto show_type_ptr = std::get_if<int>(&(show_type_iter->second));
          if (show_type_ptr) {
            int show_type_int = *show_type_ptr;
            if (show_type_int >= static_cast<int>(ShowEvent::Show) &&
                show_type_int <= static_cast<int>(ShowEvent::Dismiss)) {
              auto show_type = ShowEvent(show_type_int);
//              node->CallOnShow(show_type);
            }
          }
        }
      }
    }
  });
}
void VoltronRenderManager::RemoveShowEventListener(int32_t id, ShowEvent event) {
  RunRemoveEventListener(id, kRemoveShowFuncType, {});
}

}  // namespace voltron

#pragma once

#include "dom/render_manager.h"

namespace voltron {

using namespace hippy;
using namespace dom;

class VoltronRenderManager : public RenderManager {
 public:
  void CreateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) override;
  void MoveRenderNode(std::vector<int32_t> &&ids,
                      int32_t pid,
                      int32_t id) override;

  void Batch() override;

  void UpdateLayout(std::shared_ptr<LayoutResult> result) override;
  void UpdateLayout(std::unordered_map<LayoutDiffMapKey, float> diff) override;

  void DispatchFunction(int32_t id,
                        const std::string &name,
                        std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                        DispatchFunctionCallback cb) override;

  void AddTouchEventListener(int32_t id,
                             TouchEvent event,
                             OnTouchEventListener listener) override;
  void RemoveTouchEventListener(int32_t id, TouchEvent event) override;
};

}

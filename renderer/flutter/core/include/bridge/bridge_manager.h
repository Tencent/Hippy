#pragma once

#include "bridge/bridge_runtime.h"
#include "render/common.h"
#include "render/voltron_render_manager.h"

namespace voltron {
using hippy::DomManager;

class BridgeManager {
 public:
  static Sp<BridgeManager> GetBridgeManager(int32_t root_id);
  static void Destroy(int32_t root_id);

  explicit BridgeManager(int32_t root_id);
  ~BridgeManager();

  void BindRuntime(const Sp<PlatformRuntime>& runtime);
  void BindRenderManager(const Sp<VoltronRenderManager>& render_manager);
  void BindDomManager(const Sp<DomManager>& dom_manager);
  std::weak_ptr<PlatformRuntime> GetRuntime();
  std::weak_ptr<VoltronRenderManager> GetRenderManager();
  Sp<DomManager> GetDomManager();
 private:
  std::weak_ptr<PlatformRuntime> runtime_;
  std::weak_ptr<VoltronRenderManager> render_manager_;
  Sp<DomManager> dom_manager_;

  int32_t root_id_;
};
}  // namespace voltron

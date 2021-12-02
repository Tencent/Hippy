#include "bridge/bridge_manager.h"
#include "dom/dom_manager.h"

namespace voltron {

static Map<int32_t, Sp<BridgeManager>> bridge_map_;

void BridgeManager::BindRuntime(const voltron::Sp<PlatformRuntime>& runtime) {
  runtime_ = std::weak_ptr<PlatformRuntime>(runtime);
}

void BridgeManager::BindRenderManager(const voltron::Sp<voltron::VoltronRenderManager>& render_manager) {
  render_manager_ = std::weak_ptr<VoltronRenderManager>(render_manager);
}

std::shared_ptr<BridgeManager> BridgeManager::GetBridgeManager(int32_t root_id) {
  auto bridge_manager = bridge_map_[root_id];
  if (bridge_manager == nullptr) {
    auto new_bridge_manager = std::make_shared<BridgeManager>(root_id);
    bridge_map_[root_id] = new_bridge_manager;
    return new_bridge_manager;
  } else {
    return bridge_manager;
  }
}

void BridgeManager::Destroy(int32_t root_id) { bridge_map_[root_id] = nullptr; }

std::weak_ptr<PlatformRuntime> BridgeManager::GetRuntime() { return runtime_; }

std::weak_ptr<VoltronRenderManager> BridgeManager::GetRenderManager() { return render_manager_; }

Sp<DomManager> BridgeManager::GetDomManager() { return dom_manager_; }

void BridgeManager::BindDomManager(const Sp<DomManager>& dom_manager) { dom_manager_ = dom_manager; }

BridgeManager::~BridgeManager() {
  dom_manager_ = nullptr;
}

BridgeManager::BridgeManager(int32_t root_id) : root_id_(root_id) {}

}  // namespace voltron

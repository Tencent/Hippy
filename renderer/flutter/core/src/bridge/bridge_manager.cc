#include <iterator>

#include "bridge/bridge_manager.h"
#include "dom/dom_manager.h"

namespace voltron {

static Map<int32_t, Sp<BridgeManager>> bridge_map_;

std::shared_ptr<BridgeManager> BridgeManager::GetBridgeManager(int32_t engine_id) {
  auto bridge_manager_iter = bridge_map_.find(engine_id);
  if (bridge_manager_iter == bridge_map_.end()) {
    auto new_bridge_manager = std::make_shared<BridgeManager>(engine_id);
    bridge_map_[engine_id] = new_bridge_manager;
    return new_bridge_manager;
  } else {
    return bridge_manager_iter->second;
  }
}

void BridgeManager::Destroy(int32_t root_id) { bridge_map_[root_id] = nullptr; }

BridgeManager::~BridgeManager() {
  dom_manager_map_.clear();
  render_manager_map_.clear();
  native_callback_map_.clear();
}

BridgeManager::BridgeManager(int32_t engine_id) : engine_id_(engine_id) {
}

std::weak_ptr<PlatformRuntime> BridgeManager::GetRuntime() { return runtime_; }

std::weak_ptr<VoltronRenderManager> BridgeManager::GetRenderManager(int32_t root_id) {
  auto render_manager = render_manager_map_.find(root_id);
  if (render_manager != render_manager_map_.end()) {
    return render_manager->second;
  }
  return {};
}

Sp<DomManager> BridgeManager::GetDomManager(int32_t root_id) {
  auto dom_manager = dom_manager_map_.find(root_id);
  if (dom_manager != dom_manager_map_.end()) {
    return dom_manager->second;
  }
  return nullptr;
}

void BridgeManager::BindDomManager(int32_t root_id, const Sp<DomManager>& dom_manager) {
  dom_manager_map_[root_id] = dom_manager;
}

void BridgeManager::BindRuntime(const voltron::Sp<PlatformRuntime>& runtime) {
  runtime_ = std::weak_ptr<PlatformRuntime>(runtime);
}

void BridgeManager::BindRenderManager(int32_t root_id,
                                      const voltron::Sp<voltron::VoltronRenderManager>& render_manager) {
  render_manager_map_[root_id] = std::weak_ptr<VoltronRenderManager>(render_manager);
}

void BridgeManager::VisitAllRenderManager(const VisitRenderCallback& callback) {
  if (!render_manager_map_.empty()) {
    auto end = render_manager_map_.rbegin();
    auto begin = render_manager_map_.rend();
    while (end != begin) {
      auto render_manager = end->second;
      callback(render_manager);
      end++;
    }
  }
}

String BridgeManager::AddNativeCallback(const String& tag, const NativeCallback& callback) {
  auto callback_id = tag + std::to_string(++callback_id_increment_);
  native_callback_map_[callback_id] = callback;
  return callback_id;
}

void BridgeManager::RemoveNativeCallback(const String& callback_id) {
  native_callback_map_.erase(callback_id);
}

void BridgeManager::CallNativeCallback(const String& callback_id, std::unique_ptr<EncodableValue> params, bool keep) {
  auto native_callback_iter = native_callback_map_.find(callback_id);
  if (native_callback_iter != native_callback_map_.end()) {
    auto callback = native_callback_iter->second;
    if (callback) {
      callback(*params);
      if (!keep) {
        RemoveNativeCallback(callback_id);
      }
    }
  }
}

}  // namespace voltron

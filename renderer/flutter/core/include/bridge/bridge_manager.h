#pragma once

#include <functional>

#include "bridge/bridge_runtime.h"
#include "render/common.h"
#include "render/voltron_render_manager.h"

namespace voltron {

using hippy::DomManager;
using VisitRenderCallback = std::function<void(const std::weak_ptr<VoltronRenderManager>&)>;
using NativeCallback = std::function<void(const EncodableValue&)>;

class BridgeManager {
 public:
  static Sp<BridgeManager> GetBridgeManager(int32_t engine_id);
  static void Destroy(int32_t engine_id);

  explicit BridgeManager(int32_t engine_id);
  ~BridgeManager();

  void BindRuntime(const Sp<PlatformRuntime>& runtime);
  void BindRenderManager(int32_t root_id, const Sp<VoltronRenderManager>& render_manager);
  void BindDomManager(int32_t root_id, const Sp<DomManager>& dom_manager);
  std::weak_ptr<PlatformRuntime> GetRuntime();
  std::weak_ptr<VoltronRenderManager> GetRenderManager(int32_t root_id);
  Sp<DomManager> GetDomManager(int32_t root_id);
  void VisitAllRenderManager(const VisitRenderCallback& callback);

  String AddNativeCallback(const String& tag, const NativeCallback& callback);
  void RemoveNativeCallback(const String& callback_id);
  void CallNativeCallback(const String& callback_id, std::unique_ptr<EncodableValue> params, bool keep);
 private:
  std::weak_ptr<PlatformRuntime> runtime_;
  std::map<int, Sp<VoltronRenderManager>> render_manager_map_;
  Map<int, Sp<DomManager>> dom_manager_map_;
  Map<String, NativeCallback> native_callback_map_;

  int32_t engine_id_;
  int callback_id_increment_ = 0;
};
}  // namespace voltron

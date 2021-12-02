/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     Runtime.h
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/11
 *****************************************************************************/
#ifndef ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_RUNTIME_H_
#define ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_RUNTIME_H_

#include <memory>
#include "bridge/bridge_runtime.h"
#include "core/core.h"

using voltron::PlatformRuntime;
class Runtime {
 public:
  Runtime(std::shared_ptr<PlatformRuntime> platform_runtime, bool enable_v8_serialization, bool is_dev);

  inline bool IsEnableV8Serialization() { return enable_v8_serialization_; }
  inline bool IsDebug() { return is_debug_; }
  inline int64_t GetId() { return id_; }
  inline int64_t GetGroupId() { return group_id_; }
  inline std::shared_ptr<PlatformRuntime> GetPlatformRuntime() { return platform_runtime_; }
  inline std::shared_ptr<Engine> GetEngine() { return engine_; }
  inline std::shared_ptr<Scope> GetScope() { return scope_; }
  inline std::shared_ptr<hippy::napi::CtxValue> GetBridgeFunc() {
    return bridge_func_;
  }
  inline std::string& GetBuffer() { return serializer_reused_buffer_; }

  inline void SetGroupId(int64_t id) { group_id_ = id; }
  inline void SetBridgeFunc(std::shared_ptr<hippy::napi::CtxValue> func) {
    bridge_func_ = func;
  }
  inline void SetEngine(std::shared_ptr<Engine> engine) { engine_ = engine; }
  inline void SetScope(std::shared_ptr<Scope> scope) { scope_ = scope; }

  static void Insert(const std::shared_ptr<Runtime>& runtime);
  static std::shared_ptr<Runtime> Find(int64_t id);
  static bool Erase(int64_t id);
  static bool Erase(const std::shared_ptr<Runtime>& runtime);
  static std::shared_ptr<int64_t> GetKey(const std::shared_ptr<Runtime>& runtime);
  static bool ReleaseKey(int64_t id);

 private:
  bool enable_v8_serialization_;
  bool is_debug_;
  int64_t group_id_ = 0;
  std::shared_ptr<PlatformRuntime> platform_runtime_;
  std::string serializer_reused_buffer_;
  std::shared_ptr<Engine> engine_;
  std::shared_ptr<Scope> scope_;
  std::shared_ptr<hippy::napi::CtxValue> bridge_func_;
  int64_t id_;
};

#endif  // ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_RUNTIME_H_

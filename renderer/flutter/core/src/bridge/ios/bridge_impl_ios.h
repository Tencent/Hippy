//
//  bridge_impl_ios.h
//  RenderCore
//
//  Created by sshsong on 11/1/2021.
//

#ifndef bridge_impl_ios_h
#define bridge_impl_ios_h

#include "bridge/bridge_runtime.h"

class BridgeImpl {
 public:
  BridgeImpl() = default;
  ~BridgeImpl() = default;

 public:
  static int64_t InitJsFrameWork(std::shared_ptr<voltron::PlatformRuntime> platform_runtime,
                              bool single_thread_mode,
                              bool bridge_param_json,
                              bool is_dev_module,
                              int64_t group_id,
                              const char16_t *char_globalConfig,
                              std::function<void(int64_t)> callback);

  static bool RunScriptFromFile(int64_t runtime_id,
                                const char16_t *file_path,
                                const char16_t *script_nmae,
                                const char16_t *code_cache_dir,
                                bool can_use_code_cache,
                                std::function<void(int64_t)> callback);

  static bool RunScriptFromAssets(int64_t runtime_id, bool can_use_code_cache, const char16_t *asset_name,
                                  const char16_t *code_cache_dir, std::function<void(int64_t)> callback,
                                  const char16_t *asset_content);

  static void RunNativeRunnable(int64_t runtime_id,
                                const char16_t *code_cache_path,
                                int64_t runnable_id,
                                std::function<void(int64_t)> callback);

  static void Destroy(int64_t runtime_id, bool single_thread_mode, std::function<void(int64_t)> callback);

  static void CallFunction(int64_t runtime_id,
                           const char16_t *action,
                           const char16_t *params,
                           std::function<void(int64_t)> callback);

 private:
  static bool RunScript(int64_t runtime_id,
                        const char16_t *script,
                        const char16_t *script_name,
                        bool can_use_code_cache,
                        const char16_t *code_cache_dir);
};

#endif /* bridge_impl_ios_h */

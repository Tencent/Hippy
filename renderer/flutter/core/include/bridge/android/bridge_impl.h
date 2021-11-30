//
// Created by longquan on 2020/8/21.
//

#ifndef BRIDGE_IMPL_H
#define BRIDGE_IMPL_H

#include "runtime.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif
using unicode_string_view = tdf::base::unicode_string_view;
using voltron::PlatformRuntime;
class BridgeImpl {
 public:
  BridgeImpl() = default;
  ~BridgeImpl() = default;

 public:
  static int64_t InitJsFrameWork(const std::shared_ptr<PlatformRuntime>& platform_runtime, bool single_thread_mode,
                                 bool bridge_param_json, bool is_dev_module, int64_t group_id,
                                 const char16_t* char_globalConfig, const std::function<void(int64_t)>& callback);

  static bool RunScriptFromFile(int64_t runtime_id, const char16_t* script_path_str, const char16_t* script_name_str,
                                const char16_t* code_cache_dir_str, bool can_use_code_cache,
                                std::function<void(int64_t)> callback);

  static bool RunScriptFromAssets(int64_t runtime_id, bool can_use_code_cache, const char16_t* asset_name_str,
                                  const char16_t* code_cache_dir_str, std::function<void(int64_t)> callback,
                                  const char16_t* asset_content_str);

  static void RunNativeRunnable(int64_t runtime_id, const char16_t* code_cache_path, int64_t runnable_id,
                                std::function<void(int64_t)> callback);

  static void Destroy(int64_t runtime_id, bool single_thread_mode, std::function<void(int64_t)> callback);

  static void CallFunction(int64_t runtime_id, const char16_t* action, const char16_t* params,
                           std::function<void(int64_t)> callback);

 private:
  static bool RunScript(int64_t runtime_id, const unicode_string_view& script_content,
                        const unicode_string_view& script_name, const unicode_string_view& script_path,
                        bool can_use_code_cache, const unicode_string_view& code_cache_dir, bool fromAssets);
};

#ifdef __cplusplus
}
#endif

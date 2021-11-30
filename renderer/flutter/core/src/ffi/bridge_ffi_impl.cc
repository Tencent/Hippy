//
// Created by longquan on 2020/8/23.
//

#include <memory>

#include "bridge/bridge_extension.h"
#include "bridge/bridge_manager.h"
#include "dom/dom_manager.h"
#include "dom/render_manager_proxy.h"
#include "ffi/bridge_ffi_impl.h"
#include "ffi/callback_manager.h"
#include "ffi/ffi_platform_runtime.h"
#include "ffi/logging.h"
#include "render/common.h"

#ifdef __cplusplus
extern "C" {
#endif

using hippy::DomManager;
using hippy::RenderManagerProxy;
using voltron::BridgeManager;
using voltron::FFIPlatformRuntime;
using voltron::PlatformRuntime;
using voltron::Sp;
using voltron::VoltronRenderManager;

EXTERN_C void InitDomFFI(int32_t engine_id, int32_t root_id) {
  auto render_manager = std::make_shared<VoltronRenderManager>(engine_id);
  auto proxy_render_manager = std::make_shared<RenderManagerProxy>(render_manager);
  Sp<DomManager> dom_manager = std::make_shared<DomManager>(engine_id);
  // todo bind render manager to dom manager
  BridgeManager::GetBridgeManager(engine_id)->BindDomManager(root_id, dom_manager);
  BridgeManager::GetBridgeManager(engine_id)->BindRenderManager(root_id, render_manager);
}

EXTERN_C int64_t InitJSFrameworkFFI(const char16_t* global_config, int32_t single_thread_mode,
                                    int32_t bridge_param_json, int32_t is_dev_module, int64_t group_id,
                                    int32_t engine_id, int32_t callback_id) {
  Sp<PlatformRuntime> ffi_runtime = std::make_shared<FFIPlatformRuntime>(engine_id);
  BridgeManager::GetBridgeManager(engine_id)->BindRuntime(ffi_runtime);

  auto result = InitJSFrameworkEx(ffi_runtime, global_config, single_thread_mode, bridge_param_json, is_dev_module,
                                  group_id, [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  if (result == 0) {
    BridgeManager::Destroy(engine_id);
  }
  return result;
}

EXTERN_C int32_t RunScriptFromFileFFI(int32_t engine_id, const char16_t* file_path,
                                      const char16_t* script_name, const char16_t* code_cache_dir,
                                      int32_t can_use_code_cache, int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    return RunScriptFromFileEx(runtime_id, file_path, script_name, code_cache_dir, can_use_code_cache,
                               [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  }
  return 0;
}

EXTERN_C int32_t RunScriptFromAssetsFFI(int32_t engine_id, const char16_t* asset_name,
                                        const char16_t* code_cache_dir, int32_t can_use_code_cache,
                                        const char16_t* asset_str_char, int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  bool result = false;
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    result =
        RunScriptFromAssetsEx(runtime_id, asset_name, code_cache_dir, can_use_code_cache,

                              asset_str_char, [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  }
  if (!result) {
    delete asset_str_char;
  }
  return result;
}

EXTERN_C void CallFunctionFFI(int32_t engine_id, const char16_t* action, const char16_t* params,
                              int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    CallFunctionEx(runtime_id, action, params,
                   [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  }
}

EXTERN_C void CallNativeFunctionFFI(int32_t engine_id, const char16_t* call_id,  const uint8_t* params, const int32_t&
                                                                                                           params_len) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id);
  if (bridge_manager) {

  }
}

EXTERN_C void ConsumeRenderOpQueue(int32_t engine_id) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id);
  if (bridge_manager) {
    bridge_manager->VisitAllRenderManager([engine_id](const std::weak_ptr<VoltronRenderManager>& render_manager_ptr) {
      auto render_manager = render_manager_ptr.lock();
      if (render_manager && post_render_op_func) {
        auto render_op_buffer = render_manager->Consume();
        if (render_op_buffer) {
          auto buffer_length = static_cast<int64_t>(render_op_buffer->size());
          if (buffer_length > 0) {
            auto ptr = reinterpret_cast<const void*>(render_op_buffer->data());
            post_render_op_func(engine_id, render_manager->GetRootId(), ptr, buffer_length);
          }
        }
      }
    });
  }
}

EXTERN_C void UpdateNodeSize(int32_t engine_id, int32_t root_id, int32_t node_id, double width, double height) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (dom_manager) {
      dom_manager->SetRootSize(width, height);
    }
  }
}

EXTERN_C void RunNativeRunnableFFI(int32_t engine_id, int32_t root_id, const char16_t* code_cache_path,
                                   int64_t runnable_id, int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(root_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    RunNativeRunnableEx(runtime_id, code_cache_path, runnable_id,
                        [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  }
}

EXTERN_C const char* GetCrashMessageFFI() { return GetCrashMessageEx(); }

EXTERN_C void DestroyFFI(int32_t engine_id, bool single_thread_mode, int32_t callback_id) {
  auto runtime = voltron::BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    DestroyEx(runtime_id, single_thread_mode, [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  }
}

EXTERN_C int32_t RegisterCallFunc(int32_t type, void* func) {
  RENDER_CORE_LOG(rendercore::LoggingLevel::Info, "start register func, type %d", type);
  if (type == CALL_NATIVE_FUNC_TYPE) {
    call_native_func = reinterpret_cast<call_native>(func);
    return true;
  } else if (type == CHECK_CODE_CACHE_SANITY_FUNC_TYPE) {
    check_code_cache_sanity_func = reinterpret_cast<check_code_cache_sanity>(func);
    return true;
  } else if (type == POST_CODE_CACHE_RUNNABLE_FUNC_TYPE) {
    post_code_cache_runnable_func = reinterpret_cast<post_code_cache_runnable>(func);
    return true;
  } else if (type == REPORT_JSON_EXCEPTION_FUNC_TYPE) {
    report_json_exception_func = reinterpret_cast<report_json_exception>(func);
    return true;
  } else if (type == REPORT_JS_EXCEPTION_FUNC_TYPE) {
    report_js_exception_func = reinterpret_cast<report_js_exception>(func);
    return true;
  } else if (type == SEND_RESPONSE_FUNC_TYPE) {
    send_response_func = reinterpret_cast<send_response>(func);
    return true;
  } else if (type == SEND_NOTIFICATION_FUNC_TYPE) {
    send_notification_func = reinterpret_cast<send_notification>(func);
    return true;
  } else if (type == DESTROY_FUNC_TYPE) {
    destroy_func = reinterpret_cast<destroy_function>(func);
    return true;
  } else if (type == GLOBAL_CALLBACK_TYPE) {
    global_callback_func = reinterpret_cast<global_callback>(func);
    return true;
  } else if (type == POST_RENDER_OP_TYPE) {
    post_render_op_func = reinterpret_cast<post_render_op>(func);
    return true;
  }
  RENDER_CORE_LOG(rendercore::LoggingLevel::Error, "register func error, unknown type %d", type);
  return false;
}

bool CallGlobalCallback(int32_t callbackId, int64_t value) {
  if (global_callback_func) {
    const Work work = [value, callbackId]() { global_callback_func(callbackId, value); };
    const Work* work_ptr = new Work(work);
    RENDER_CORE_LOG(rendercore::LoggingLevel::Info, "start callback");
    PostWorkToDart(work_ptr);
    return true;
  } else {
    RENDER_CORE_LOG(rendercore::LoggingLevel::Error, "call callback error, func not found");
  }
  return false;
}

EXTERN_C void Test() {
  //  const char16_t *params =
  //      "[10,[{\"index\":0,\"props\":{\"onPressIn\":true,\"style\":{\"width\":250,\"marginTop\":30,\"borderColor\":-11756806,\"alignItems\":\"center\",\"borderRadius\":8,\"height\":50,\"opacity\":1.0,\"borderWidth\":2,\"justifyContent\":\"center\"},\"onPressOut\":true,\"onClick\":true},\"name\":\"View\",\"id\":108,\"pId\":109}]]";
  //  int paramLen = strlen(params);
  //  const void *params_data = reinterpret_cast<const void *>(params);
  //  callNativeFunc(0,
  //                 "module_name",
  //                 "module_func",
  //                 "call_id",
  //                 params_data,
  //                 paramLen,
  //                 true);
  //
  //  const int length = 223;
  //  int8_t a[length] =
  //      {6, 2, 4, 20, 6, 1, 7, 5, 2, 105, 100, 4, -40, 1, 3, 112, 73, 100, 4, -38,
  //       1, 5, 105, 110, 100, 101, 120, 4, 0, 4, 110, 97, 109, 101, 8, 4, 86, 105,
  //       101, 119, 5, 112, 114, 111, 112, 115, 7, 4, 9, 111, 110, 80, 114, 101,
  //       115, 115, 73, 110, 2, 10, 111, 110, 80, 114, 101, 115, 115, 79, 117, 116,
  //       2, 7, 111, 110, 67, 108, 105, 99, 107, 2, 5, 115, 116, 121, 108, 101, 7,
  //       9, 11, 98, 111, 114, 100, 101, 114, 67, 111, 108, 111, 114, 4, -117,
  //       -108, -101, 11, 11, 98, 111, 114, 100, 101, 114, 87, 105, 100, 116, 104,
  //       4, 4, 12, 98, 111, 114, 100, 101, 114, 82, 97, 100, 105, 117, 115, 4, 16,
  //       14, 106, 117, 115, 116, 105, 102, 121, 67, 111, 110, 116, 101, 110, 116,
  //       8, 6, 99, 101, 110, 116, 101, 114, 10, 97, 108, 105, 103, 110, 73, 116,
  //       101, 109, 115, 8, 6, 99, 101, 110, 116, 101, 114, 5, 119, 105, 100, 116,
  //       104, 4, -12, 3, 6, 104, 101, 105, 103, 104, 116, 4, 100, 9, 109, 97, 114,
  //       103, 105, 110, 84, 111, 112, 4, 60, 7, 111, 112, 97, 99, 105, 116, 121,
  //       5, 63, -16, 0, 0, 0, 0, 0, 0};
  //  int8_t *data = new int8_t[length];
  //  for (int i = 0; i < length; i++) {
  //    data[i] = a[i];
  //  }
  //  int paramLenData = length;
  //  const void *paramsDataByte = reinterpret_cast<const void *>(data);
  //  callNativeFunc(0,
  //                 "module_name",
  //                 "module_func",
  //                 "call_id",
  //                 paramsDataByte,
  //                 paramLenData,
  //                 false);
}

#ifdef __cplusplus
}
#endif

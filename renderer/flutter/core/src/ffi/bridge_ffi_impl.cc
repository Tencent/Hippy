//
// Created by longquan on 2020/8/23.
//

#include <memory>

#include "bridge/bridge_manager.h"
#include "bridge/string_util.h"
#include "dom/dom_manager.h"
#include "dom/render_manager_proxy.h"
#include "ffi/bridge_ffi_impl.h"
#include "ffi/callback_manager.h"
#include "ffi/ffi_platform_runtime.h"
#include "ffi/logging.h"
#include "render/common.h"
#include "standard_message_codec.h"
#include "render/layout.h"

#if defined(__ANDROID__) || defined(_WIN32)
#include "bridge_impl.h"
#else
#include "bridge_impl_ios.h"
#endif

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
using voltron::StandardMessageCodec;
using voltron::EncodableValue;
using voltron::VoltronLayoutContext;

EXTERN_C void InitDomFFI(int32_t engine_id, int32_t root_id) {
  auto render_manager = std::make_shared<VoltronRenderManager>(engine_id, root_id);
//  auto proxy_render_manager = std::make_shared<RenderManagerProxy>(render_manager);
  Sp<DomManager> dom_manager = std::make_shared<DomManager>(engine_id);
  dom_manager->SetRenderManager(render_manager);
  BridgeManager::GetBridgeManager(engine_id)->BindDomManager(root_id, dom_manager);
  BridgeManager::GetBridgeManager(engine_id)->BindRenderManager(root_id, render_manager);
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    BridgeImpl::BindDomManager(runtime_id, dom_manager);
  }
}

EXTERN_C int64_t InitJSFrameworkFFI(const char16_t *global_config,
                                    int32_t single_thread_mode,
                                    int32_t bridge_param_json,
                                    int32_t is_dev_module,
                                    int64_t group_id,
                                    int32_t engine_id,
                                    int32_t callback_id) {
  Sp<PlatformRuntime> ffi_runtime = std::make_shared<FFIPlatformRuntime>(engine_id);
  BridgeManager::GetBridgeManager(engine_id)->BindRuntime(ffi_runtime);

  auto result = BridgeImpl::InitJsFrameWork(ffi_runtime,
                                            single_thread_mode,
                                            bridge_param_json,
                                            is_dev_module,
                                            group_id,
                                            global_config,
                                            [callback_id](int64_t value) {
                                              CallGlobalCallback(callback_id,
                                                                 value);
                                            });
  ffi_runtime->SetRuntimeId(result);

  return result;
}

EXTERN_C int32_t RunScriptFromFileFFI(int32_t engine_id, const char16_t* file_path, const char16_t* script_name,
                                      const char16_t* code_cache_dir, int32_t can_use_code_cache, int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    return BridgeImpl::RunScriptFromFile(runtime_id, file_path, script_name, code_cache_dir, can_use_code_cache,
                                         [callback_id](int64_t value) { CallGlobalCallback(callback_id, value); });
  }
  return 0;
}

EXTERN_C int32_t RunScriptFromAssetsFFI(int32_t engine_id, const char16_t* asset_name, const char16_t* code_cache_dir,
                                        int32_t can_use_code_cache, const char16_t* asset_str_char,
                                        int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  bool result = false;
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    result = BridgeImpl::RunScriptFromAssets(
        runtime_id, can_use_code_cache, asset_name, code_cache_dir,
        [callback_id](int value) { CallGlobalCallback(callback_id, value); }, asset_str_char);
  }
  if (!result) {
    delete asset_str_char;
  }
  return result;
}

EXTERN_C void CallFunctionFFI(int32_t engine_id, const char16_t* action, const char16_t* params, int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    BridgeImpl::CallFunction(runtime_id,
                             action,
                             params,
                             [callback_id](int64_t value) {
                               CallGlobalCallback(callback_id, value);
                             });
  }
}

EXTERN_C void CallNativeFunctionFFI(int32_t engine_id, const char16_t* call_id, const uint8_t* params,
                                    const int32_t& params_len, int32_t keep) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id);
  if (bridge_manager) {
    bool is_keep = keep;
    std::string call_id_str = C16CharToString(call_id);
    std::unique_ptr<EncodableValue> decode_params =
        StandardMessageCodec::GetInstance().DecodeMessage(params, params_len);
    bridge_manager->CallNativeCallback(call_id_str, std::move(decode_params), is_keep);
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

EXTERN_C void SetNodeCustomMeasure(int32_t engine_id, int32_t root_id, int32_t node_id) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id);
  if (bridge_manager) {
    auto dom_manager = bridge_manager->GetDomManager(root_id);
    if (dom_manager) {
      auto dom_node = dom_manager->GetNode(node_id);
      if (dom_node) {
        auto layout_node = dom_node->GetLayoutNode();
        if (layout_node) {
          auto taitank_layout_node = std::static_pointer_cast<hippy::TaitankLayoutNode>(layout_node);
          auto voltronLayoutContext = new VoltronLayoutContext();
          voltronLayoutContext->node_id = node_id;
          voltronLayoutContext->engine_id = engine_id;
          voltronLayoutContext->root_id = root_id;
          taitank_layout_node->SetLayoutContext(voltronLayoutContext);
          taitank_layout_node->SetMeasureFunction(VoltronMeasureFunction);
        }
      }
    }
  }
}

HPSize VoltronMeasureFunction(HPNodeRef node, float width, MeasureMode widthMeasureMode, float height,
                            MeasureMode heightMeasureMode, void* layoutContext) {
  if (layoutContext) {
    auto voltronLayoutContext = reinterpret_cast<VoltronLayoutContext *>(layoutContext);
    auto bridge_manager = BridgeManager::GetBridgeManager(voltronLayoutContext->engine_id);
    if (bridge_manager) {
      auto runtime = bridge_manager->GetRuntime().lock();
      if (runtime) {
        auto measure_result = runtime->CalculateNodeLayout(voltronLayoutContext->root_id,
                                                           voltronLayoutContext->node_id, width,
                                     widthMeasureMode, height, heightMeasureMode);
        int32_t w_bits = 0xFFFFFFFF & (measure_result >> 32);
        int32_t h_bits = 0xFFFFFFFF & measure_result;
        return HPSize{(float) w_bits, (float) h_bits};
      }
    }
  }

  return HPSize{0, 0};
}

EXTERN_C void NotifyRenderManager(int32_t engine_id) {
  auto bridge_manager = BridgeManager::GetBridgeManager(engine_id);
  if (bridge_manager) {
    bridge_manager->VisitAllRenderManager([](const std::weak_ptr<VoltronRenderManager>& render_manager_ptr) {
      auto render_manager = render_manager_ptr.lock();
      if (render_manager) {
        render_manager->Notify();
      }
    });
  }
}

EXTERN_C void RunNativeRunnableFFI(int32_t engine_id, const char16_t* code_cache_path,
                                   int64_t runnable_id, int32_t callback_id) {
  auto runtime = BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    BridgeImpl::RunNativeRunnable(runtime_id,
                                  code_cache_path,
                                  runnable_id,
                                  [callback_id](int value) {
                                    CallGlobalCallback(callback_id, value);
                                  });
  }
}

EXTERN_C const char* GetCrashMessageFFI() { return "lucas_crash_report_test"; }

EXTERN_C void DestroyFFI(int32_t engine_id, bool single_thread_mode, int32_t callback_id) {
  auto runtime = voltron::BridgeManager::GetBridgeManager(engine_id)->GetRuntime().lock();
  if (runtime) {
    auto runtime_id = runtime->GetRuntimeId();
    BridgeImpl::Destroy(runtime_id,
                        single_thread_mode,
                        [callback_id](int64_t value) {
                          CallGlobalCallback(callback_id, value);
                        });
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
  } else if (type == CALCULATE_NODE_LAYOUT_TYPE) {
    calculate_node_layout_func = reinterpret_cast<calculate_node_layout>(func);
    return true;
  }
  RENDER_CORE_LOG(rendercore::LoggingLevel::Error, "register func error, unknown type %d", type);
  return false;
}

bool CallGlobalCallback(int32_t callback_id, int64_t value) {
  if (global_callback_func) {
    const Work work = [value, callback_id]() { global_callback_func(callback_id, value); };
    const Work* work_ptr = new Work(work);
    RENDER_CORE_LOG(rendercore::LoggingLevel::Info, "start callback");
    PostWorkToDart(work_ptr);
    return true;
  } else {
    RENDER_CORE_LOG(rendercore::LoggingLevel::Error, "call callback error, func not found");
  }
  return false;
}

#ifdef __cplusplus
}
#endif

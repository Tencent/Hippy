/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     dart2js.cc
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/15
 *****************************************************************************/
#include "bridge/android/dart2js.h"
#include "bridge/android/runtime.h"
#include "bridge/string_util.h"
#ifdef V8_HAS_INSPECTOR
#include "inspector/v8_inspector_client_impl.h"
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
extern std::shared_ptr<V8InspectorClientImpl> global_inspector;
#endif

namespace voltron {
namespace bridge{

using CtxValue = hippy::napi::CtxValue;
using Ctx = hippy::napi::Ctx;


const char kHippyBridgeName[] = "hippyBridge";

void CallJSFunction(int64_t runtime_id,
                    const unicode_string_view &action_name,
                    const unicode_string_view &params_data,
                    std::function<void(int64_t)> callback) {
  TDF_BASE_DLOG(INFO) << "CallFunction runtime_id = " << runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "CallFunction j_runtime_id invalid";
    return;
  }

  std::shared_ptr<JavaScriptTaskRunner> runner =
      runtime->GetEngine()->GetJSRunner();
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();

  task->callback = [runtime, callback_ = std::move(callback),
      action_name, params_data] {

    std::shared_ptr<Scope> scope = runtime->GetScope();
    if (!scope) {
      TDF_BASE_DLOG(WARNING) << "CallFunction scope invalid";
      return;
    }

    std::shared_ptr<Ctx> context = scope->GetContext();
    if (!runtime->GetBridgeFunc()) {
      TDF_BASE_DLOG(INFO) << "init bridge func";
      unicode_string_view name(kHippyBridgeName);
      std::shared_ptr<CtxValue> fn = context->GetJsFn(name);
      bool is_fn = context->IsFunction(fn);
      TDF_BASE_DLOG(INFO) << "is_fn = " << is_fn;

      if (!is_fn) {
        callback_(0);
      } else {
        runtime->SetBridgeFunc(fn);
      }
    }

    if (runtime->IsDebug() && action_name.utf16_value() == u"onWebsocketMsg") {
#ifdef V8_HAS_INSPECTOR
      global_inspector->SendMessageToV8(params_data);
#endif
      return;
    }
    std::shared_ptr<CtxValue> action = context->CreateString(action_name);
    std::shared_ptr<CtxValue> params = context->CreateObject(params_data);
    if (!params) {
      params = context->CreateNull();
    }
    std::shared_ptr<CtxValue> argv[] = {action, params};
    context->CallFunction(runtime->GetBridgeFunc(), 2, argv);
    callback_(1);
  };
  runner->PostTask(task);
}

}  // namespace bridge
}  // namespace voltron

//
// Created by longquan on 2020/8/23.
//

#include "ffi/ffi_platform_runtime.h"
#include <iostream>
#include "ffi/callback_manager.h"
#include "ffi/logging.h"

namespace voltron {
void FFIPlatformRuntime::CallNaive(const char16_t* moduleName, const char16_t* moduleFunc, const char16_t* callId,
                                   const void* paramsData, uint32_t paramsLen, bool bridgeParamJson,
                                   std::function<void()> callback, bool autoFree) {
  if (call_native_func) {
    const Work work = [root_id = root_id_, moduleName, moduleFunc, callId, paramsData, paramsLen, bridgeParamJson,
                       callback_ = std::move(callback), autoFree]() {
      call_native_func(root_id, moduleName, moduleFunc, callId, paramsData, paramsLen, bridgeParamJson);
      if (callback_) {
        callback_();
      }

      if (autoFree) {
        // free之前所有malloc的字符串
        if (moduleName) {
          free((void*)moduleName);
        }
        if (moduleFunc) {
          free((void*)moduleFunc);
        }
        if (callId) {
          free((void*)callId);
        }
        if (paramsData) {
          free((void*)paramsData);
        }
      }
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::PostCodeCacheRunnable(const char* codeCacheDirChar, int64_t runnableId,
                                               bool needClearException) {
  if (post_code_cache_runnable_func) {
    const Work work = [runtimeId = runtime_id_, codeCacheDirChar, runnableId, needClearException]() {
      post_code_cache_runnable_func(runtimeId, codeCacheDirChar, runnableId, needClearException);
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::ReportJSONException(const char* jsonValue) {
  if (report_json_exception_func) {
    const Work work = [runtimeId = runtime_id_, jsonValue]() { report_json_exception_func(runtimeId, jsonValue); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::ReportJSException(const char16_t* description_stream, const char16_t* stack_stream) {
  if (report_js_exception_func) {
    const Work work = [runtimeId = runtime_id_, description_stream, stack_stream]() {
      report_js_exception_func(runtimeId, description_stream, stack_stream);

      if (description_stream) {
        free((void*)description_stream);
      }

      if (stack_stream) {
        free((void*)stack_stream);
      }
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::CheckCodeCacheSanity(const char* scriptMd5) {
  if (check_code_cache_sanity_func) {
    const Work work = [runtimeId = runtime_id_, scriptMd5]() { check_code_cache_sanity_func(runtimeId, scriptMd5); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::SendResponse(const uint16_t* source, int len) {
  void* copy = (void*)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void*)source, len * sizeof(uint16_t));
  if (send_response_func) {
    const Work work = [runtimeId = runtime_id_, data = (uint16_t*)copy, len]() {
      send_response_func(runtimeId, data, len);
      free(data);
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::SendNotification(const uint16_t* source, int len) {
  RENDER_CORE_LOG(rendercore::LoggingLevel::Debug, "SendNotification, len: %d", len);
  void* copy = (void*)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void*)source, len * sizeof(uint16_t));
  if (send_notification_func) {
    const Work work = [runtimeId = runtime_id_, data = (uint16_t*)copy, len]() {
      send_notification_func(runtimeId, data, len);
      free(data);
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::Destroy() {
  if (destroy_func) {
    const Work work = [runtimeId = runtime_id_]() { destroy_func(runtimeId); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

FFIPlatformRuntime::FFIPlatformRuntime(int32_t rid) : root_id_(rid) {}
const void* FFIPlatformRuntime::copyParamsData(const void* form, uint32_t length) {
  if (form != nullptr && length > 0) {
    auto* copyData = new int8_t[length];
    memcpy(copyData, form, length);
    return reinterpret_cast<const void*>(copyData);
  }

  return nullptr;
}

void FFIPlatformRuntime::BindRuntimeId(int64_t runtime_id) { runtime_id_ = runtime_id; }

int64_t FFIPlatformRuntime::GetRuntimeId() { return runtime_id_; }
}  // namespace voltron
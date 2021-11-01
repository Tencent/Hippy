//
// Created by longquan on 2020/8/23.
//

#include "ffi/ffi_platform_runtime.h"
#include "ffi/callback_manager.h"
#include <iostream>
#include "ffi/logging.h"


void FFIPlatformRuntime::CallNaive(const char16_t *moduleName,
                                   const char16_t *moduleFunc,
                                   const char16_t *callId,
                                   const void *paramsData,
                                   uint32_t paramsLen,
                                   bool bridgeParamJson, std::function<void()> callback,
                                   bool autoFree) {
  if (callNativeFunc) {
    const Work work = [runtimeId = runtime_id_, moduleName, moduleFunc, callId, paramsData,
                       paramsLen, bridgeParamJson, callback_ = std::move(callback), autoFree]() {
      callNativeFunc(runtimeId, moduleName, moduleFunc, callId, paramsData, paramsLen, bridgeParamJson);
      if (callback_) {
        callback_();
      }

      if (autoFree) {
        // free之前所有malloc的字符串
        if (moduleName) {
          free((void *) moduleName);
        }
        if (moduleFunc) {
          free((void *) moduleFunc);
        }
        if (callId) {
          free((void *)callId);
        }
        if (paramsData) {
          free((void *)paramsData);
        }
      }
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::PostCodeCacheRunnable(const char *codeCacheDirChar,
                                               int64_t runnableId,
                                               bool needClearException) {
  if (postCodeCacheRunnableFunc) {
    const Work work = [runtimeId = runtime_id_, codeCacheDirChar, runnableId, needClearException]() {
      postCodeCacheRunnableFunc(runtimeId, codeCacheDirChar, runnableId, needClearException);
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::ReportJSONException(const char *jsonValue) {
  if (reportJsonExceptionFunc) {
    const Work work = [runtimeId = runtime_id_, jsonValue]() {
      reportJsonExceptionFunc(runtimeId, jsonValue);
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::ReportJSException(const char16_t *description_stream,
                                           const char16_t *stack_stream) {
  if (reportJsExceptionFunc) {
    const Work work = [runtimeId = runtime_id_, description_stream, stack_stream]() {
      reportJsExceptionFunc(runtimeId, description_stream, stack_stream);

      if (description_stream) {
        free((void *)description_stream);
      }

      if (stack_stream) {
        free((void *)stack_stream);
      }
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::CheckCodeCacheSanity(const char *scriptMd5) {
  if (checkCodeCacheSanityFunc) {
    const Work work = [runtimeId = runtime_id_, scriptMd5]() {
      checkCodeCacheSanityFunc(runtimeId, scriptMd5);
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::SendResponse(const uint16_t *source, int len) {
  void *copy = (void *)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void *)source, len * sizeof(uint16_t));
  if (sendResponseFunc) {
    const Work work = [runtimeId = runtime_id_, data = (uint16_t *)copy, len]() {
      sendResponseFunc(runtimeId, data, len);
      free(data);
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::SendNotification(const uint16_t *source, int len) {
  RENDER_CORE_LOG(rendercore::LoggingLevel::Debug, "SendNotification, len: %d", len);
  void *copy = (void *)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void *)source, len * sizeof(uint16_t));
  if (sendNotificationFunc) {
    const Work work = [runtimeId = runtime_id_, data = (uint16_t *)copy, len]() {
      sendNotificationFunc(runtimeId, data, len);
      free(data);
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::Destroy() {
  if (destroyFunc) {
    const Work work = [runtimeId = runtime_id_]() {
      destroyFunc(runtimeId);
    };
    const Work* work_ptr = new Work(work);
    postWorkToDart(work_ptr);
  }
}

FFIPlatformRuntime::FFIPlatformRuntime(long rid): runtime_id_(rid) {

}
const void *FFIPlatformRuntime::copyParamsData(const void *form, uint32_t length) {
  if (form != nullptr && length > 0) {
    auto* copyData = new int8_t[length];
    memcpy(copyData, form, length);
    return reinterpret_cast<const void* >(copyData);
  }

  return nullptr;
}


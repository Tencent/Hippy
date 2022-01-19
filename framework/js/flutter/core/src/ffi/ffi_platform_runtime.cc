/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
#include <mutex>

#include "ffi/callback_manager.h"
#include "ffi/ffi_platform_runtime.h"

namespace voltron {
void FFIPlatformRuntime::CallNaive(const char16_t* moduleName, const char16_t* moduleFunc, const char16_t* callId,
                                   const void* paramsData, uint32_t paramsLen, bool bridgeParamJson,
                                   std::function<void()> callback, bool autoFree) {
  if (call_native_func) {
    const Work work = [engine_id = engine_id_, moduleName, moduleFunc, callId, paramsData, paramsLen, bridgeParamJson,
                       callback_ = std::move(callback), autoFree]() {
      call_native_func(engine_id, moduleName, moduleFunc, callId, paramsData, paramsLen, bridgeParamJson);
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

void FFIPlatformRuntime::ReportJSONException(const char* jsonValue) {
  if (report_json_exception_func) {
    const Work work = [engine_id = engine_id_, jsonValue]() { report_json_exception_func(engine_id, jsonValue); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::ReportJSException(const char16_t* description_stream, const char16_t* stack_stream) {
  if (report_js_exception_func) {
    const Work work = [engine_id = engine_id_, description_stream, stack_stream]() {
      report_js_exception_func(engine_id, description_stream, stack_stream);

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

void FFIPlatformRuntime::SendResponse(const uint16_t* source, int len) {
  void* copy = (void*)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void*)source, len * sizeof(uint16_t));
  if (send_response_func) {
    const Work work = [engine_id = engine_id_, data = (uint16_t*)copy, len]() {
      send_response_func(engine_id, data, len);
      free(data);
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

void FFIPlatformRuntime::SendNotification(const uint16_t* source, int len) {
  void* copy = (void*)malloc(len * sizeof(uint16_t));
  memset(copy, 0, len * sizeof(uint16_t));
  memcpy(copy, (void*)source, len * sizeof(uint16_t));
  if (send_notification_func) {
    const Work work = [engine_id = engine_id_, data = (uint16_t*)copy, len]() {
      send_notification_func(engine_id, data, len);
      free(data);
    };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

int64_t FFIPlatformRuntime::CalculateNodeLayout(int32_t instance_id, int32_t node_id, double width, int32_t width_mode,
                                                double height, int32_t height_mode) {
  std::mutex mutex;
  std::unique_lock<std::mutex> lock(mutex);

  std::condition_variable cv;
  bool notified = false;

  int64_t result;
  const Work work = [&result, &cv, &notified, engine_id = engine_id_, instance_id, node_id, width, width_mode, height,
                     height_mode]() {
    auto result_ptr =
        calculate_node_layout_func(engine_id, instance_id, node_id, width, width_mode, height, height_mode);
    if (result_ptr) {
      result = *result_ptr;
    } else {
      result = 0;
    }
    delete result_ptr;
    notified = true;
    cv.notify_one();
  };
  const Work* work_ptr = new Work(work);
  PostWorkToDart(work_ptr);
  while (!notified) {
    cv.wait(lock);
  }
  return result;
}

void FFIPlatformRuntime::Destroy() {
  if (destroy_func) {
    const Work work = [engine_id = engine_id_]() { destroy_func(engine_id); };
    const Work* work_ptr = new Work(work);
    PostWorkToDart(work_ptr);
  }
}

FFIPlatformRuntime::FFIPlatformRuntime(int32_t engine_id) : engine_id_(engine_id) {}

const void* FFIPlatformRuntime::copyParamsData(const void* form, uint32_t length) {
  if (form != nullptr && length > 0) {
    auto* copyData = new int8_t[length];
    memcpy(copyData, form, length);
    return reinterpret_cast<const void*>(copyData);
  }

  return nullptr;
}

void FFIPlatformRuntime::SetRuntimeId(int64_t runtime_id) { runtime_id_ = runtime_id; }

int64_t FFIPlatformRuntime::GetRuntimeId() { return runtime_id_; }

}  // namespace voltron

//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_runtime_adapter.h"
#include <string>
#ifdef OS_ANDROID
#include "core/runtime/v8/runtime.h"
#endif

namespace hippy {
namespace devtools {
bool HippyRuntimeAdapter::IsDebug() {
#ifdef OS_ANDROID
  auto runtime = Runtime::Find(runtime_id_);
  if (!runtime) {
    TDF_BASE_DLOG(INFO) << "IsDebug runtime is null";
    return false;
  }
  return runtime->IsDebug();
#else
  return true;  // TODO: thomasyqguo, iOS 里面拿不到 Runtime
#endif
}
}  // namespace devtools
}  // namespace hippy

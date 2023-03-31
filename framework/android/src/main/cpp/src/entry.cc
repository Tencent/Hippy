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

#include <sys/stat.h>

#include <any>
#include <future>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>

#include "footstone/check.h"
#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "footstone/persistent_object_map.h"
#include "footstone/string_view_utils.h"
#include "footstone/worker_manager.h"
#include "jni/data_holder.h"
#include "jni/jni_env.h"
#include "jni/jni_invocation.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "vfs/handler/asset_handler.h"
#include "vfs/handler/file_handler.h"
#include "vfs/handler/jni_delegate_handler.h"
#include "vfs/uri_loader.h"
#include "vfs/uri.h"
#include "vfs/vfs_resource_holder.h"

namespace hippy {
inline namespace framework {
inline namespace bridge {

using string_view = footstone::stringview::string_view;
using TaskRunner = footstone::runner::TaskRunner;
using Task = footstone::runner::Task;
using WorkerManager = footstone::WorkerManager;
using u8string = string_view::u8string;
using StringViewUtils = footstone::stringview::StringViewUtils;
using UriLoader = hippy::vfs::UriLoader;

static std::mutex log_mutex;
static bool is_initialized = false;

enum INIT_CB_STATE {
  DESTROY_ERROR = -2,
  RUN_SCRIPT_ERROR = -1,
  SUCCESS = 0,
};

constexpr char kLogTag[] = "native";
constexpr char kFileSchema[] = "file";

void setNativeLogHandler(JNIEnv* j_env, __unused jobject j_object, jobject j_logger) {
  if (!j_logger) {
    return;
  }

  jclass j_cls = j_env->GetObjectClass(j_logger);
  if (!j_cls) {
    return;
  }

  jmethodID j_method =
      j_env->GetMethodID(j_cls, "onReceiveLogMessage", "(ILjava/lang/String;Ljava/lang/String;)V");
  if (!j_method) {
    return;
  }
  std::shared_ptr<JavaRef> logger = std::make_shared<JavaRef>(j_env, j_logger);
  {
    std::lock_guard<std::mutex> lock(log_mutex);
    if (!is_initialized) {
      footstone::log::LogMessage::InitializeDelegate([logger, j_method](
          const std::ostringstream& stream,
          footstone::log::LogSeverity severity) {
        std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
        JNIEnv* j_env = instance->AttachCurrentThread();

        std::string str = stream.str();
        jstring j_logger_str = j_env->NewStringUTF((str.c_str()));
        jstring j_tag_str = j_env->NewStringUTF(kLogTag);
        jint j_level = static_cast<jint>(severity);
        j_env->CallVoidMethod(logger->GetObj(), j_method, j_level, j_tag_str, j_logger_str);
        JNIEnvironment::ClearJEnvException(j_env);
        j_env->DeleteLocalRef(j_tag_str);
        j_env->DeleteLocalRef(j_logger_str);
      });
      is_initialized = true;
    }
  }
}

jint OnCreateVfs(JNIEnv* j_env, __unused jobject j_object, jobject j_vfs_manager) {
  auto delegate = std::make_shared<JniDelegateHandler>(j_env, j_vfs_manager);
  auto id = hippy::global_data_holder_key.fetch_add(1);
  auto loader = std::make_shared<UriLoader>();
  auto file_delegate = std::make_shared<FileHandler>();
  loader->RegisterUriHandler(kFileSchema, file_delegate);
  loader->PushDefaultHandler(delegate);

  hippy::global_data_holder.Insert(id, loader);
  return footstone::checked_numeric_cast<uint32_t, jint>(id);
}

void OnDestroyVfs(__unused JNIEnv* j_env, __unused jobject j_object, jint j_id) {
  auto id = footstone::checked_numeric_cast<jint, uint32_t>(j_id);
  auto flag = hippy::global_data_holder.Erase(id);
  FOOTSTONE_DCHECK(flag);
}

REGISTER_STATIC_JNI("com/tencent/mtt/hippy/HippyEngine", // NOLINT(cert-err58-cpp)
                    "setNativeLogHandler",
                    "(Lcom/tencent/mtt/hippy/adapter/HippyLogAdapter;)V",
                    setNativeLogHandler)

REGISTER_JNI("com/tencent/mtt/hippy/HippyEngineManagerImpl", // NOLINT(cert-err58-cpp)
             "onCreateVfs",
             "(Lcom/tencent/vfs/VfsManager;)I",
             OnCreateVfs)

REGISTER_JNI("com/tencent/mtt/hippy/HippyEngineManagerImpl", // NOLINT(cert-err58-cpp)
             "onDestroyVfs",
             "(I)V",
             OnDestroyVfs)

} // namespace bridge
} // namespace framework
} // namespace hippy


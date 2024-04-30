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

#include "loader/adr_loader.h"

#include <android/asset_manager_jni.h>
#include <future>

#include "bridge/runtime.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/uri.h"

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using HippyFile = hippy::base::HippyFile;
using u8string = unicode_string_view::u8string;
using char8_t_ = unicode_string_view::char8_t_;

static std::atomic<int64_t> global_request_id{0};
static jclass j_context_holder_class;
static jmethodID j_get_app_context_method_id;

bool ADRLoader::RequestUntrustedContent(const unicode_string_view& uri,
                                        std::function<void(u8string)> cb) {
  auto uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    TDF_BASE_DLOG(ERROR) << "uri error, uri = " << uri;
    cb(u8string());
    return false;
  }
  unicode_string_view schema = uri_obj->GetScheme();
  if (StringViewUtils::IsEmpty(schema)) {
    TDF_BASE_DLOG(ERROR) << "schema error, uri = " << uri;
    cb(u8string());
    return false;
  }
  unicode_string_view path = uri_obj->GetPath();
  if (StringViewUtils::IsEmpty(path)) {
    TDF_BASE_DLOG(ERROR) << "path error, uri = " << uri;
    cb(u8string());
    return false;
  }
  TDF_BASE_DCHECK(schema.encoding() == unicode_string_view::Encoding::Utf16);
  std::u16string schema_str = schema.utf16_value();
  if (schema_str == u"file") {
    return LoadByFile(path, cb);
  } else if (schema_str == u"asset") {
    auto aasset_manager = GetAAssetManager();
    if (aasset_manager) {
      return LoadByAsset(path, cb, false);
    }
    TDF_BASE_DLOG(ERROR) << "aasset_manager error, uri = " << uri;
    cb(u8string());
    return false;
  } else {
    return LoadByJni(uri, cb);
  }
}

bool ADRLoader::RequestUntrustedContent(const unicode_string_view& uri,
                                        u8string& content) {
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    TDF_BASE_DLOG(ERROR) << "uri error, uri = " << uri;
    return false;
  }
  unicode_string_view schema = uri_obj->GetScheme();
  if (StringViewUtils::IsEmpty(schema)) {
    TDF_BASE_DLOG(ERROR) << "schema error, uri = " << uri;
    return false;
  }
  unicode_string_view path = uri_obj->GetPath();
  if (StringViewUtils::IsEmpty(path)) {
    TDF_BASE_DLOG(ERROR) << "path error, uri = " << uri;
    return false;
  }
  TDF_BASE_DCHECK(schema.encoding() == unicode_string_view::Encoding::Utf16);
  std::u16string schema_str = schema.utf16_value();
  if (schema_str == u"file") {
    return HippyFile::ReadFile(path, content, false);
  } else if (schema_str == u"http" || schema_str == u"https" ||
             schema_str == u"debug") {
    std::promise<u8string> promise;
    std::future<u8string> read_file_future = promise.get_future();
    std::function<void(u8string)> cb = hippy::base::MakeCopyable(
        [p = std::move(promise)](u8string bytes) mutable {
          p.set_value(std::move(bytes));
        });
    bool ret = LoadByJni(uri, cb);
    content = read_file_future.get();
    return ret;
  } else if (schema_str == u"asset") {
    auto aasset_manager = ADRLoader::GetAAssetManager();
    if (aasset_manager) {
      return ReadAsset(path, aasset_manager, content, false);
    }

    TDF_BASE_DLOG(ERROR) << "aasset_manager error, uri = " << uri;
    return false;
  } else {
    TDF_BASE_DLOG(ERROR) << "schema error, schema = " << schema;
    return false;
  }
}

AAssetManager* ADRLoader::GetAAssetManager() {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_context = j_env->CallStaticObjectMethod(j_context_holder_class, j_get_app_context_method_id);
  auto j_context_class = j_env->GetObjectClass(j_context);
  auto j_get_assets_method_id = j_env->GetMethodID(j_context_class, "getAssets", "()Landroid/content/res/AssetManager;");
  auto j_asset_manager = j_env->CallObjectMethod(j_context, j_get_assets_method_id);
  return AAssetManager_fromJava(j_env, j_asset_manager);
}

bool ADRLoader::LoadByFile(const unicode_string_view& path,
                           const std::function<void(u8string)>& cb) {
  std::shared_ptr<WorkerTaskRunner> runner = runner_.lock();
  if (!runner) {
    return false;
  }
  std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
  task->func_ = [path, cb] {
    u8string ret;
    HippyFile::ReadFile(path, ret, false);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(task));

  return true;
}

bool ADRLoader::LoadByAsset(const unicode_string_view& path,
                            const std::function<void(u8string)>& cb,
                            bool is_auto_fill) {
  TDF_BASE_DLOG(INFO) << "ReadAssetFile file_path = " << path;
  std::shared_ptr<WorkerTaskRunner> runner = runner_.lock();
  if (!runner) {
    return false;
  }
  std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
  task->func_ = [path, is_auto_fill, cb] {
    u8string ret;
    auto aasset_manager = GetAAssetManager();
    ReadAsset(path, aasset_manager, ret, is_auto_fill);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(task));

  return true;
}

bool ADRLoader::LoadByJni(const unicode_string_view& uri,
                          const std::function<void(u8string)>& cb) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  if (instance->GetMethods().j_fetch_resource_method_id) {
    int64_t id = SetRequestCB(cb);
    jstring j_relative_path = JniUtils::StrViewToJString(j_env, uri);
    j_env->CallVoidMethod(bridge_->GetObj(),
                          instance->GetMethods().j_fetch_resource_method_id,
                          j_relative_path, id);
    JNIEnvironment::ClearJEnvException(j_env);
    j_env->DeleteLocalRef(j_relative_path);
    return true;
  }

  TDF_BASE_DLOG(ERROR) << "jni fetch_resource_method_id error";
  return false;
}

void OnResourceReady(JNIEnv* j_env,
                     __unused jobject j_object,
                     jobject j_buffer,
                     jlong j_runtime_id,
                     jlong j_request_id) {
  TDF_BASE_DLOG(INFO) << "HippyBridgeImpl onResourceReady j_runtime_id = " << j_runtime_id;
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl onResourceReady, j_runtime_id invalid";
    return;
  }
  auto runner = runtime->GetEngine()->GetWorkerTaskRunner();
  if (!runner) {
    return;
  }
  std::weak_ptr<Scope> weak_scope = runtime->GetScope();
  int64_t request_id = j_request_id;
  auto buffer = std::make_shared<JavaRef>(j_env, j_buffer);
  auto task = std::make_unique<CommonTask>();
  task->func_ = [weak_scope, request_id, buffer_ = std::move(buffer)] {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    std::shared_ptr<ADRLoader> loader = std::static_pointer_cast<ADRLoader>(scope->GetUriLoader());
    TDF_BASE_DLOG(INFO) << "request_id = " << request_id;
    auto cb = loader->GetRequestCB(request_id);
    if (!cb) {
      TDF_BASE_DLOG(WARNING) << "cb not found" << request_id;
      return;
    }
    auto j_buffer = buffer_->GetObj();
    if (!j_buffer) {
      TDF_BASE_DLOG(INFO) << "HippyBridgeImpl onResourceReady, buff null";
      cb(u8string());
      return;
    }
    auto len = j_env->GetDirectBufferCapacity(j_buffer);
    TDF_BASE_DLOG(INFO) << "len = " << len;
    if (len == -1) {
      TDF_BASE_DLOG(ERROR) << "HippyBridgeImpl onResourceReady, BufferCapacity error";
      cb(u8string());
      return;
    }
    auto buff = j_env->GetDirectBufferAddress(j_buffer);
    if (!buff) {
      TDF_BASE_DLOG(INFO) << "HippyBridgeImpl onResourceReady, buff null";
      cb(u8string());
      return;
    }

    u8string str(reinterpret_cast<const char8_t_ *>(buff),
                 hippy::base::checked_numeric_cast<jlong, size_t>(len));
    cb(std::move(str));
  };
  runner->PostTask(std::move(task));
}

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "onResourceReady",
             "(Ljava/nio/ByteBuffer;JJ)V",
             OnResourceReady)

std::function<void(u8string)> ADRLoader::GetRequestCB(int64_t request_id) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto it = request_map_.find(request_id);
  return it != request_map_.end() ? it->second : nullptr;
}

int64_t ADRLoader::SetRequestCB(const std::function<void(u8string)>& cb) {
  std::lock_guard<std::mutex> lock(mutex_);
  int64_t id = global_request_id.fetch_add(1);
  request_map_.insert({id, cb});
  return id;
}

void ADRLoader::Init() {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_context_holder_class = reinterpret_cast<jclass>(j_env->NewGlobalRef(
      j_env->FindClass("com/tencent/mtt/hippy/utils/ContextHolder")));
  j_get_app_context_method_id = j_env->GetStaticMethodID(
      j_context_holder_class, "getAppContext","()Landroid/content/Context;");
}

void ADRLoader::Destroy() {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_env->DeleteGlobalRef(j_context_holder_class);
}

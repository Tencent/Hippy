#include <__bit_reference>
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

#include <future>

#include "bridge/runtime.h"
#include "core/base/string_view_utils.h"
#include "core/core.h"
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

ADRLoader::ADRLoader() : aasset_manager_(nullptr) {}

bool ADRLoader::RequestUntrustedContent(const unicode_string_view& uri,
                                        std::function<void(u8string)> cb) {
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    TDF_BASE_DLOG(ERROR) << "uri error, uri = " << uri;
    cb(u8string());
    return false;
  }
  unicode_string_view schema = uri_obj->GetScheme();
  unicode_string_view path = uri_obj->GetPath();
  TDF_BASE_DCHECK(schema.encoding() == unicode_string_view::Encoding::Utf16);
  std::u16string schema_str = schema.utf16_value();
  if (schema_str == u"file") {
    return LoadByFile(path, cb);
  } else if (schema_str == u"http" || schema_str == u"https" ||
             schema_str == u"debug") {
    return LoadByHttp(uri, cb);
  } else if (schema_str == u"asset") {
    if (aasset_manager_) {
      return LoadByAsset(path, cb, false);
    }
    TDF_BASE_DLOG(ERROR) << "aasset_manager error, uri = " << uri;
    cb(u8string());
    return false;
  } else {
    TDF_BASE_DLOG(ERROR) << "schema error, schema = " << schema;
    cb(u8string());
    return false;
  }
}

bool ADRLoader::RequestUntrustedContent(const unicode_string_view& uri,
                                        u8string& content) {
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    TDF_BASE_DLOG(ERROR) << "uri error, uri = " << uri;
    return "";
  }
  unicode_string_view schema = uri_obj->GetScheme();
  unicode_string_view path = uri_obj->GetPath();
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
    bool ret = LoadByHttp(uri, cb);
    content = read_file_future.get();
    return ret;
  } else if (schema_str == u"asset") {
    if (aasset_manager_) {
      return ReadAsset(path, aasset_manager_, content, false);
    }

    TDF_BASE_DLOG(ERROR) << "aasset_manager error, uri = " << uri;
    return "";
  } else {
    TDF_BASE_DLOG(ERROR) << "schema error, schema = " << schema;
    return "";
  }
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
  task->func_ = [path, aasset_manager = aasset_manager_, is_auto_fill, cb] {
    u8string ret;
    ReadAsset(path, aasset_manager, ret, is_auto_fill);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(task));

  return true;
}

bool ADRLoader::LoadByHttp(const unicode_string_view& uri,
                           const std::function<void(u8string)>& cb) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();

  if (instance->GetMethods().j_fetch_resource_method_id) {
    int64_t id = SetRequestCB(cb);
    jstring j_relative_path = JniUtils::StrViewToJString(j_env, uri);
    j_env->CallVoidMethod(bridge_->GetObj(),
                          instance->GetMethods().j_fetch_resource_method_id,
                          j_relative_path, id);
    j_env->DeleteLocalRef(j_relative_path);
    return true;
  }

  TDF_BASE_DLOG(ERROR) << "jni fetch_resource_method_id error";
  return false;
}

void OnResourceReady(JNIEnv* j_env,
                     __unused jobject j_object,
                     jobject j_byte_buffer,
                     jlong j_runtime_id,
                     jlong j_request_id) {
  TDF_BASE_DLOG(INFO) << "HippyBridgeImpl onResourceReady j_runtime_id = "
                      << j_runtime_id;
  std::shared_ptr<Runtime> runtime = Runtime::Find(JniUtils::CheckedNumericCast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    TDF_BASE_DLOG(WARNING)
        << "HippyBridgeImpl onResourceReady, j_runtime_id invalid";
    return;
  }
  std::shared_ptr<Scope> scope = runtime->GetScope();
  if (!scope) {
    TDF_BASE_DLOG(WARNING) << "HippyBridgeImpl onResourceReady, scope invalid";
    return;
  }

  std::shared_ptr<ADRLoader> loader =
      std::static_pointer_cast<ADRLoader>(scope->GetUriLoader());
  int64_t request_id = j_request_id;
  TDF_BASE_DLOG(INFO) << "request_id = " << request_id;
  auto cb = loader->GetRequestCB(request_id);
  if (!cb) {
    TDF_BASE_DLOG(WARNING) << "cb not found" << request_id;
    return;
  }
  if (!j_byte_buffer) {
    TDF_BASE_DLOG(INFO) << "HippyBridgeImpl onResourceReady, buff null";
    cb(u8string());
    return;
  }
  auto len = (j_env)->GetDirectBufferCapacity(j_byte_buffer);
  TDF_BASE_DLOG(INFO) << "len = " << len;
  if (len == -1) {
    TDF_BASE_DLOG(ERROR)
        << "HippyBridgeImpl onResourceReady, BufferCapacity error";
    cb(u8string());
    return;
  }
  void* buff = (j_env)->GetDirectBufferAddress(j_byte_buffer);
  if (!buff) {
    TDF_BASE_DLOG(INFO) << "HippyBridgeImpl onResourceReady, buff null";
    cb(u8string());
    return;
  }

  u8string str(reinterpret_cast<const char8_t_*>(buff), JniUtils::CheckedNumericCast<jlong, size_t>(len));
  cb(std::move(str));
}

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl", // NOLINT(cert-err58-cpp)
             "onResourceReady",
             "(Ljava/nio/ByteBuffer;JJ)V",
             OnResourceReady)

std::function<void(u8string)> ADRLoader::GetRequestCB(int64_t request_id) {
  auto it = request_map_.find(request_id);
  return it != request_map_.end() ? it->second : nullptr;
}

int64_t ADRLoader::SetRequestCB(const std::function<void(u8string)>& cb) {
  int64_t id = global_request_id.fetch_add(1);
  request_map_.insert({id, cb});
  return id;
}

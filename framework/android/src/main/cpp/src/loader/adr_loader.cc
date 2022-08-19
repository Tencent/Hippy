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

#include "driver/runtime/v8/runtime.h"
#include "driver/base/file.h"
#include "footstone/string_view_utils.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/uri.h"

namespace hippy {
inline namespace framework {
inline namespace loader {

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using Runtime = hippy::Runtime;
using Scope = hippy::Scope;
using HippyFile = hippy::base::HippyFile;
using u8string = string_view::u8string;
using char8_t_ = string_view::char8_t_;

static std::atomic<int64_t> global_request_id{0};

ADRLoader::ADRLoader() : aasset_manager_(nullptr) {}

bool ADRLoader::RequestUntrustedContent(const string_view& uri,
                                        std::function<void(u8string)> cb) {
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    FOOTSTONE_DLOG(ERROR) << "uri error, uri = " << uri;
    cb(u8string());
    return false;
  }
  string_view schema = uri_obj->GetScheme();
  if (StringViewUtils::IsEmpty(schema)) {
    FOOTSTONE_DLOG(ERROR) << "schema error, uri = " << uri;
    cb(u8string());
    return false;
  }
  string_view path = uri_obj->GetPath();
  if (StringViewUtils::IsEmpty(path)) {
    FOOTSTONE_DLOG(ERROR) << "path error, uri = " << uri;
    cb(u8string());
    return false;
  }
  FOOTSTONE_DCHECK(schema.encoding() == string_view::Encoding::Utf16);
  std::u16string schema_str = schema.utf16_value();
  if (schema_str == u"file") {
    return LoadByFile(path, cb);
  } else if (schema_str == u"http" || schema_str == u"https" || schema_str == u"debug") {
    return LoadByHttp(uri, cb);
  } else if (schema_str == u"asset") {
    if (aasset_manager_) {
      return LoadByAsset(path, cb, false);
    }
    FOOTSTONE_DLOG(ERROR) << "aasset_manager error, uri = " << uri;
    cb(u8string());
    return false;
  } else {
    FOOTSTONE_DLOG(ERROR) << "schema error, schema = " << schema;
    cb(u8string());
    return false;
  }
}

bool ADRLoader::RequestUntrustedContent(const string_view& uri,
                                        u8string& content) {
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    FOOTSTONE_DLOG(ERROR) << "uri error, uri = " << uri;
    return false;
  }
  string_view schema = uri_obj->GetScheme();
  if (StringViewUtils::IsEmpty(schema)) {
    FOOTSTONE_DLOG(ERROR) << "schema error, uri = " << uri;
    return false;
  }
  string_view path = uri_obj->GetPath();
  if (StringViewUtils::IsEmpty(path)) {
    FOOTSTONE_DLOG(ERROR) << "path error, uri = " << uri;
    return false;
  }
  FOOTSTONE_DCHECK(schema.encoding() == string_view::Encoding::Utf16);
  std::u16string schema_str = schema.utf16_value();
  if (schema_str == u"file") {
    return HippyFile::ReadFile(path, content, false);
  } else if (schema_str == u"http" || schema_str == u"https" || schema_str == u"debug") {
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

    FOOTSTONE_DLOG(ERROR) << "aasset_manager error, uri = " << uri;
    return false;
  } else {
    FOOTSTONE_DLOG(ERROR) << "schema error, schema = " << schema;
    return false;
  }
}

bool ADRLoader::LoadByFile(const string_view& path,
                           const std::function<void(u8string)>& cb) {
  auto runner = runner_.lock();
  if (!runner) {
    return false;
  }
  auto func = [path, cb] {
    u8string ret;
    HippyFile::ReadFile(path, ret, false);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(func));

  return true;
}

bool ADRLoader::LoadByAsset(const string_view& path,
                            const std::function<void(u8string)>& cb,
                            bool is_auto_fill) {
  FOOTSTONE_DLOG(INFO) << "ReadAssetFile file_path = " << path;
  auto runner = runner_.lock();
  if (!runner) {
    return false;
  }
  auto func = [path, aasset_manager = aasset_manager_, is_auto_fill, cb] {
    u8string ret;
    ReadAsset(path, aasset_manager, ret, is_auto_fill);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(func));

  return true;
}

bool ADRLoader::LoadByHttp(const string_view& uri,
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

  FOOTSTONE_DLOG(ERROR) << "jni fetch_resource_method_id error";
  return false;
}

void OnResourceReady(JNIEnv* j_env,
                     __unused jobject j_object,
                     jobject j_byte_buffer,
                     jlong j_runtime_id,
                     jlong j_request_id) {
  FOOTSTONE_DLOG(INFO) << "HippyBridgeImpl onResourceReady j_runtime_id = " << j_runtime_id;
  auto
      runtime = Runtime::Find(footstone::check::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  if (!runtime) {
    FOOTSTONE_DLOG(WARNING) << "HippyBridgeImpl onResourceReady, j_runtime_id invalid";
    return;
  }
  std::shared_ptr<Scope> scope = runtime->GetScope();
  if (!scope) {
    FOOTSTONE_DLOG(WARNING) << "HippyBridgeImpl onResourceReady, scope invalid";
    return;
  }

  std::shared_ptr<ADRLoader> loader =
      std::static_pointer_cast<ADRLoader>(scope->GetUriLoader());
  int64_t request_id = j_request_id;
  FOOTSTONE_DLOG(INFO) << "request_id = " << request_id;
  auto cb = loader->GetRequestCB(request_id);
  if (!cb) {
    FOOTSTONE_DLOG(WARNING) << "cb not found" << request_id;
    return;
  }
  if (!j_byte_buffer) {
    FOOTSTONE_DLOG(INFO) << "HippyBridgeImpl onResourceReady, buff null";
    cb(u8string());
    return;
  }
  int64_t len = (j_env)->GetDirectBufferCapacity(j_byte_buffer);
  FOOTSTONE_DLOG(INFO) << "len = " << len;
  if (len == -1) {
    FOOTSTONE_DLOG(ERROR) << "HippyBridgeImpl onResourceReady, BufferCapacity error";
    cb(u8string());
    return;
  }
  void* buff = (j_env)->GetDirectBufferAddress(j_byte_buffer);
  if (!buff) {
    FOOTSTONE_DLOG(INFO) << "HippyBridgeImpl onResourceReady, buff null";
    cb(u8string());
    return;
  }

  u8string str(reinterpret_cast<const char8_t_*>(buff),
               footstone::check::checked_numeric_cast<jlong, size_t>(len));
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

}
}
}

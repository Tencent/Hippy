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
#include "core/core.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/uri.h"

static std::atomic<int64_t> global_request_id{0};

static std::string ReadAsset(const std::string& file_path,
                             AAssetManager* aasset_manager,
                             bool is_auto_fill) {
  std::string path(file_path);
  if (path.length() > 0 && path[0] == '/') {
    path = path.substr(1);
  }
  HIPPY_LOG(hippy::Debug, "path = %s", path.c_str());
  auto asset =
      AAssetManager_open(aasset_manager, path.c_str(), AASSET_MODE_STREAMING);
  std::string file_data;
  if (asset) {
    int size = AAsset_getLength(asset);
    if (is_auto_fill) {
      size += 1;
    }
    file_data.resize(size);
    int offset = 0;
    int readbytes;
    while ((readbytes = AAsset_read(asset, &file_data[0] + offset,
                                    file_data.size() - offset)) > 0) {
      offset += readbytes;
    }
    if (is_auto_fill) {
      file_data.back() = '\0';
    }
    AAsset_close(asset);
  }
  HIPPY_DLOG(hippy::Debug, "file_path = %s, len = %d,  file_data = %s",
             file_path.c_str(), file_data.length(), file_data.c_str());
  return file_data;
}

ADRLoader::ADRLoader() : aasset_manager_(nullptr) {}

bool ADRLoader::RequestUntrustedContent(const std::string& uri,
                                        std::function<void(std::string)> cb) {
  std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(uri);
  std::string uri_schema = uri_obj->GetScheme();
  std::string path = uri_obj->GetPath();
  if (uri_schema == "file") {
    return LoadByFile(path, cb);
  } else if (uri_schema == "http" || uri_schema == "https" ||
             uri_schema == "debug") {
    return LoadByHttp(uri, cb);
  } else if (uri_schema == "asset") {
    if (aasset_manager_) {
      return LoadByAsset(path, cb, false);
    }

    HIPPY_LOG(hippy::Error, "aasset_manager error, uri = %s", uri.c_str());
    return false;
  } else {
    HIPPY_LOG(hippy::Error, "schema error, schema = %s", uri_schema.c_str());
    return false;
  }
}

std::string ADRLoader::RequestUntrustedContent(const std::string& uri) {
  std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(uri);
  std::string uri_schema = uri_obj->GetScheme();
  std::string path = uri_obj->GetPath();
  if (uri_schema == "file") {
    return hippy::base::HippyFile::ReadFile(path.c_str(), false);
  } else if (uri_schema == "http" || uri_schema == "https" ||
             uri_schema == "debug") {
    std::promise<std::string> promise;
    std::future<std::string> read_file_future = promise.get_future();
    std::function<void(std::string)> cb = hippy::base::MakeCopyable(
        [p = std::move(promise)](std::string content) mutable {
          p.set_value(std::move(content));
        });
    LoadByHttp(uri, cb);
    return read_file_future.get();
  } else if (uri_schema == "asset") {
    if (aasset_manager_) {
      return ReadAsset(path, aasset_manager_, false);
    }

    HIPPY_LOG(hippy::Error, "aasset_manager error, uri = %s", uri.c_str());
    return "";
  } else {
    HIPPY_LOG(hippy::Error, "schema error, schema = %s", uri_schema.c_str());
    return "";
  }
}

bool ADRLoader::LoadByFile(const std::string& path,
                           std::function<void(std::string)> cb) {
  std::shared_ptr<WorkerTaskRunner> runner = runner_.lock();
  if (!runner) {
    return false;
  }
  std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
  task->func_ = [path, cb] {
    std::string ret = hippy::base::HippyFile::ReadFile(path.c_str(), false);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(task));

  return true;
}

bool ADRLoader::LoadByAsset(const std::string& file_path,
                            std::function<void(std::string)> cb,
                            bool is_auto_fill) {
  HIPPY_LOG(hippy::Debug, "ReadAssetFile file_path = %s", file_path.c_str());

  std::shared_ptr<WorkerTaskRunner> runner = runner_.lock();
  if (!runner) {
    return false;
  }
  std::unique_ptr<CommonTask> task = std::make_unique<CommonTask>();
  task->func_ = [file_path, aasset_manager = aasset_manager_, is_auto_fill,
                 cb] {
    std::string ret = ReadAsset(file_path, aasset_manager, is_auto_fill);
    cb(std::move(ret));
  };
  runner->PostTask(std::move(task));

  return true;
}

bool ADRLoader::LoadByHttp(const std::string& uri,
                           std::function<void(std::string)> cb) {
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* env = instance->AttachCurrentThread();

  if (instance->GetMethods().fetch_resource_method_id) {
    int64_t id = SetRequestCB(cb);
    jstring j_relative_path = env->NewStringUTF(uri.c_str());
    env->CallVoidMethod(bridge_->GetObj(),
                        instance->GetMethods().fetch_resource_method_id,
                        j_relative_path, id);
    env->DeleteLocalRef(j_relative_path);
    return true;
  }

  HIPPY_LOG(hippy::Error, "jni fetch_resource_method_id error");
  return false;
}

void OnResourceReady(JNIEnv* j_env,
                     jobject j_object,
                     jobject j_byte_buffer,
                     jlong j_runtime_id,
                     jlong j_request_id) {
  HIPPY_DLOG(hippy::Debug,
             "HippyBridgeImpl onResourceReady j_runtime_id = %lld",
             j_runtime_id);
  std::shared_ptr<Runtime> runtime = Runtime::Find(j_runtime_id);
  if (!runtime) {
    HIPPY_LOG(hippy::Warning,
              "HippyBridgeImpl onResourceReady, j_runtime_id invalid");
    return;
  }
  std::shared_ptr<Scope> scope = runtime->GetScope();
  if (!scope) {
    HIPPY_LOG(hippy::Warning, "HippyBridgeImpl onResourceReady, scope invalid");
    return;
  }

  std::shared_ptr<ADRLoader> loader =
      std::static_pointer_cast<ADRLoader>(scope->GetUriLoader());
  int64_t request_id = j_request_id;
  HIPPY_DLOG(hippy::Debug, "request_id = %lld", request_id);
  auto cb = loader->GetRequestCB(request_id);
  if (!cb) {
    HIPPY_LOG(hippy::Warning, "cb not found", request_id);
    return;
  }
  if (!j_byte_buffer) {
    HIPPY_DLOG(hippy::Debug, "HippyBridgeImpl onResourceReady, buff null");
    cb("");
    return;
  }
  int64_t len = (j_env)->GetDirectBufferCapacity(j_byte_buffer);
  if (len == -1) {
    HIPPY_LOG(hippy::Error,
              "HippyBridgeImpl onResourceReady, BufferCapacity error");
    cb("");
    return;
  }
  void* buff = (j_env)->GetDirectBufferAddress(j_byte_buffer);
  if (!buff) {
    HIPPY_DLOG(hippy::Debug, "HippyBridgeImpl onResourceReady, buff null");
    cb("");
    return;
  }

  std::string str(reinterpret_cast<const char*>(buff), len);
  cb(std::move(str));
}

REGISTER_JNI("com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
             "onResourceReady",
             "(Ljava/nio/ByteBuffer;JJ)V",
             OnResourceReady)

std::function<void(std::string)> ADRLoader::GetRequestCB(int64_t request_id) {
  auto it = request_map_.find(request_id);
  return it != request_map_.end() ? it->second : nullptr;
}

int64_t ADRLoader::SetRequestCB(std::function<void(std::string)> cb) {
  int64_t id = global_request_id.fetch_add(1);
  request_map_.insert({id, cb});
  return id;
}

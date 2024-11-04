/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "vfs/handler/asset_handler.h"

#include "footstone/check.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "vfs/uri.h"
#include "jni/jni_env.h"


constexpr char kRunnerName[] = "asset_handler_runner";

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

namespace hippy {
inline namespace vfs {

static jclass j_context_holder_class;
static jmethodID j_get_app_context_mothod_id;

bool ReadAsset(const string_view& path,
               AAssetManager* aasset_manager,
               UriHandler::bytes& bytes,
               bool is_auto_fill) {
  auto file_path = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(path, string_view::Encoding::Utf8).utf8_value());
  const char* asset_path = file_path.c_str();
  if (file_path.length() > 0 && file_path[0] == '/') {
    file_path = file_path.substr(1);
    asset_path = file_path.c_str();
  }
  FOOTSTONE_DLOG(INFO) << "asset_path = " << asset_path;
  auto asset = AAssetManager_open(aasset_manager, asset_path, AASSET_MODE_STREAMING);
  if (asset) {
    auto size = AAsset_getLength(asset);
    if (is_auto_fill) {
      size += 1;
    }
    size_t file_size;
    auto flag = footstone::numeric_cast(size, file_size);
    if (!flag) {
      return false;
    }
    bytes.resize(file_size);
    size_t offset = 0;
    int read_bytes;
    while ((read_bytes = AAsset_read(asset, &bytes[0] + offset, bytes.size() - offset)) > 0) {
      offset += static_cast<size_t>(read_bytes);
    }
    if (is_auto_fill) {
      bytes.back() = '\0';
    }
    AAsset_close(asset);
    FOOTSTONE_DLOG(INFO) << "path = " << path << ", len = " << bytes.length();
    return true;
  }
  FOOTSTONE_DLOG(INFO) << "ReadFile fail, file_path = " << file_path;
  return false;
}

void AssetHandler::Init(JNIEnv* j_env) {
  j_context_holder_class = reinterpret_cast<jclass>(j_env->NewGlobalRef(
      j_env->FindClass("com/tencent/mtt/hippy/utils/ContextHolder")));
  j_get_app_context_mothod_id = j_env->GetStaticMethodID(
      j_context_holder_class, "getAppContext","()Landroid/content/Context;");
}

void AssetHandler::Destroy(JNIEnv* j_env) {
  j_env->DeleteGlobalRef(j_context_holder_class);
}

void AssetHandler::RequestUntrustedContent(
    std::shared_ptr<RequestJob> request,
    std::shared_ptr<JobResponse> response,
    std::function<std::shared_ptr<UriHandler>()> next) {
  auto uri_obj = Uri::Create(request->GetUri());
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    response->SetRetCode(hippy::JobResponse::RetCode::PathError);
    return;
  }

  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_context = j_env->CallStaticObjectMethod(j_context_holder_class, j_get_app_context_mothod_id);
  auto j_context_class = j_env->GetObjectClass(j_context);
  auto j_get_assets_method_id = j_env->GetMethodID(j_context_class, "getAssets", "()Landroid/content/res/AssetManager;");
  auto j_asset_manager = j_env->CallObjectMethod(j_context, j_get_assets_method_id);
  auto asset_manager = AAssetManager_fromJava(j_env, j_asset_manager);
  bool ret = ReadAsset(path, asset_manager, response->GetContent(), false);
  if (ret) {
    response->SetRetCode(hippy::JobResponse::RetCode::Success);
  } else {
    response->SetRetCode(hippy::JobResponse::RetCode::Failed);
  }
  auto next_handler = next();
  if (next_handler) {
    next_handler->RequestUntrustedContent(request, response, next);
  }
}

void AssetHandler::RequestUntrustedContent(
    std::shared_ptr<RequestJob> request,
    std::function<void(std::shared_ptr<JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  auto uri_obj = Uri::Create(request->GetUri());
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    cb(std::make_shared<JobResponse>(UriHandler::RetCode::PathError));
    return;
  }
  auto new_cb = [orig_cb = cb](std::shared_ptr<JobResponse> response) {
    orig_cb(response);
  };
  LoadByAsset(path, request, new_cb, next);
}

void AssetHandler::LoadByAsset(const string_view& path,
                               std::shared_ptr<RequestJob> request,
                               std::function<void(std::shared_ptr<JobResponse>)> cb,
                               std::function<std::shared_ptr<UriHandler>()> next,
                               bool is_auto_fill) {
  FOOTSTONE_DLOG(INFO) << "ReadAssetFile file_path = " << path;
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_context = j_env->CallStaticObjectMethod(j_context_holder_class, j_get_app_context_mothod_id);
  auto j_context_class = j_env->GetObjectClass(j_context);
  auto j_get_assets_method_id = j_env->GetMethodID(j_context_class, "getAssets", "()Landroid/content/res/AssetManager;");
  auto j_asset_manager = j_env->CallObjectMethod(j_context, j_get_assets_method_id);
  auto manager = std::make_shared<JavaRef>(j_env, j_asset_manager);
  {
    std::lock_guard<std::mutex> lock_guard(mutex_);
    if (!runner_) {
      runner_ = request->GetWorkerManager()->CreateTaskRunner(kRunnerName);
    }
  }
  runner_->PostTask([path, manager, cb, is_auto_fill] {
    UriHandler::bytes content;
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    bool ret = ReadAsset(path,
                         AAssetManager_fromJava(j_env, manager->GetObj()),
                         content, is_auto_fill);
    if (ret) {
      cb(std::make_shared<JobResponse>(hippy::JobResponse::RetCode::Success, "",
                                       std::unordered_map<std::string, std::string>{}, std::move(content)));
    } else {
      cb(std::make_shared<JobResponse>(hippy::JobResponse::RetCode::Failed));
    }
  });
}

}
}

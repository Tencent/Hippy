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

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

namespace hippy {
inline namespace vfs {



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
    FOOTSTONE_DLOG(INFO) << "path = " << path << ", len = " << bytes.length()
                         << ", file_data = "
                         << reinterpret_cast<const char*>(bytes.c_str());
    return true;
  }
  FOOTSTONE_DLOG(INFO) << "ReadFile fail, file_path = " << file_path;
  return false;
}

AssetHandler::AssetHandler() {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  context_ = AssetHandler::GetAppContext(j_env);
  auto j_context_class = j_env->GetObjectClass(context_->GetObj());
  get_assets_method_id_ = j_env->GetMethodID(j_context_class, "getAssets", "()Landroid/content/res/AssetManager;");
}

std::shared_ptr<JavaRef> AssetHandler::GetAppContext(JNIEnv* j_env) {
  auto activity_thread = j_env->FindClass("android/app/ActivityThread");
  auto current_activity_method_id = j_env->GetStaticMethodID(activity_thread, "currentActivityThread", "()Landroid/app/ActivityThread;");
  auto activity = j_env->CallStaticObjectMethod(activity_thread, current_activity_method_id);
  auto get_application_method_id = j_env->GetMethodID(activity_thread, "getApplication", "()Landroid/app/Application;");
  auto context = j_env->CallObjectMethod(activity, get_application_method_id);
  return std::make_shared<JavaRef>(j_env, context);
}

void AssetHandler::RequestUntrustedContent(
    std::shared_ptr<SyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = ctx->uri;
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    ctx->code = UriHandler::RetCode::PathError;
    return;
  }

  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_asset_manager = j_env->CallObjectMethod(context_->GetObj(), get_assets_method_id_);
  auto asset_manager = AAssetManager_fromJava(j_env, j_asset_manager);
  bool ret = ReadAsset(path, asset_manager, ctx->content, false);
  if (ret) {
    ctx->code = UriHandler::RetCode::Success;
  } else {
    ctx->code = UriHandler::RetCode::Failed;
  }
  auto next_handler = next();
  if (next_handler) {
    next_handler->RequestUntrustedContent(ctx, next);
  }
}

void AssetHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = ctx->uri;
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    ctx->cb(UriHandler::RetCode::PathError, {}, UriHandler::bytes());
    return;
  }
  auto new_cb = [orig_cb = ctx->cb](RetCode code , std::unordered_map<std::string, std::string> meta, bytes content) {
    orig_cb(code, std::move(meta), std::move(content));
  };
  ctx->cb = new_cb;
  LoadByAsset(path, ctx, next);
}

void AssetHandler::LoadByAsset(const string_view& path,
                               std::shared_ptr<ASyncContext> ctx,
                               std::function<std::shared_ptr<UriHandler>()> next,
                               bool is_auto_fill) {
  FOOTSTONE_DLOG(INFO) << "ReadAssetFile file_path = " << path;
  auto runner = runner_.lock();
  if (!runner) {
    ctx->cb(UriHandler::RetCode::DelegateError, {}, UriHandler::bytes());
    return;
  }
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_asset_manager = j_env->CallObjectMethod(context_->GetObj(), get_assets_method_id_);
  auto manager = std::make_shared<JavaRef>(j_env, j_asset_manager);
  runner->PostTask([path, manager, is_auto_fill, ctx] {
    UriHandler::bytes content;
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    bool ret = ReadAsset(path,
                         AAssetManager_fromJava(j_env, manager->GetObj()),
                         content, is_auto_fill);
    if (ret) {
      ctx->cb(UriHandler::RetCode::Success, {}, std::move(content));
    } else {
      ctx->cb(UriHandler::RetCode::Failed, {}, std::move(content));
    }
  });
}

}
}

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

constexpr char kRunnerName[] = "asset_handler_runner";

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;

namespace hippy {
inline namespace vfs {

bool ReadAssetFrowRawfile(const char *asset_path, NativeResourceManager *resource_manager, UriHandler::bytes &bytes, bool is_auto_fill) {
  FOOTSTONE_DLOG(INFO) << "asset_path = " << asset_path;
  RawFile *asset = OH_ResourceManager_OpenRawFile(resource_manager, asset_path);
  if (asset) {
    auto file_size = OH_ResourceManager_GetRawFileSize(asset);
    size_t size = static_cast<size_t>(file_size);
    if (is_auto_fill) {
      size += 1;
    }
    bytes.resize(size);
    int read_bytes = OH_ResourceManager_ReadRawFile(asset, &bytes[0], static_cast<size_t>(file_size));
    if (read_bytes != file_size) {
      OH_ResourceManager_CloseRawFile(asset);
      FOOTSTONE_LOG(ERROR) << "read bytes error, path = " << asset_path << ", fileSize = " << file_size
                           << ", readBytes = " << read_bytes;
      return false;
    }
    if (is_auto_fill) {
      bytes.back() = '\0';
    }
    OH_ResourceManager_CloseRawFile(asset);
    FOOTSTONE_DLOG(INFO) << "path = " << asset_path << ", len = " << bytes.length()
                         << ", file_data = " << reinterpret_cast<const char *>(bytes.c_str());
    return true;
  }

  FOOTSTONE_DLOG(INFO) << "ReadFile fail, file_path = " << asset_path;
  return false;
}

bool ReadAssetFrowResfile(const char *asset_path, const std::string &res_module_name, UriHandler::bytes &bytes, bool is_auto_fill) {
  std::string res_file_path = std::string("/data/storage/el1/bundle/") + res_module_name + "/resources/resfile/" + asset_path;
  asset_path = res_file_path.c_str();
  FOOTSTONE_DLOG(INFO) << "asset_path = " << asset_path;
  
  FILE *asset = fopen(asset_path, "rb");
  if (asset) {
    fseek(asset, 0, SEEK_END);
    auto file_size = ftell(asset);
    size_t size = static_cast<size_t>(file_size);
    if (is_auto_fill) {
      size += 1;
    }
    bytes.resize(size);
    fseek(asset, 0, SEEK_SET);
    auto read_count = fread(&bytes[0], static_cast<size_t>(file_size), 1, asset);
    if (read_count != 1) {
      fclose(asset);
      FOOTSTONE_LOG(ERROR) << "read bytes error, path = " << asset_path << ", fileSize = " << file_size
                           << ", readCount = " << read_count;
      return false;
    }
    if (is_auto_fill) {
      bytes.back() = '\0';
    }
    fclose(asset);
    FOOTSTONE_DLOG(INFO) << "path = " << asset_path << ", len = " << bytes.length()
                         << ", file_data = " << reinterpret_cast<const char *>(bytes.c_str());
    return true;
  }

  FOOTSTONE_DLOG(INFO) << "ReadFile fail, file_path = " << asset_path;
  return false;
}

bool ReadAsset(const string_view &path, bool is_rawfile, NativeResourceManager *resource_manager, const std::string &res_module_name, UriHandler::bytes &bytes, bool is_auto_fill) {
  auto file_path = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(path, string_view::Encoding::Utf8).utf8_value());
  const char *asset_path = file_path.c_str();
  if (file_path.length() > 0 && file_path[0] == '/') {
    file_path = file_path.substr(1);
    asset_path = file_path.c_str();
  }

  if (is_rawfile) {
    return ReadAssetFrowRawfile(asset_path, resource_manager, bytes, is_auto_fill);
  } else {
    return ReadAssetFrowResfile(asset_path, res_module_name, bytes, is_auto_fill);
  }
}

AssetHandler::~AssetHandler() {
  if (resource_manager_) {
    OH_ResourceManager_ReleaseNativeResourceManager(resource_manager_);
    resource_manager_ = nullptr;
  }
}

void AssetHandler::Init(napi_env env, bool is_rawfile, napi_value ts_resource_manager, std::string &res_module_name) {
  is_rawfile_ = is_rawfile;
  res_module_name_ = res_module_name;
  // must in main thread, or crash
  resource_manager_ = OH_ResourceManager_InitNativeResourceManager(env, ts_resource_manager);
  FOOTSTONE_DCHECK(resource_manager_);
  if (!resource_manager_) {
    FOOTSTONE_LOG(ERROR) << "AssetHandler::Init, init resource_manager_ fail";
    return;
  }
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

  bool ret = ReadAsset(path, is_rawfile_, resource_manager_, res_module_name_,response->GetContent(), false);
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
  auto new_cb = [orig_cb = cb](std::shared_ptr<JobResponse> response) { orig_cb(response); };
  LoadByAsset(path, request, new_cb, next);
}

void AssetHandler::LoadByAsset(const string_view& path,
                               std::shared_ptr<RequestJob> request,
                               std::function<void(std::shared_ptr<JobResponse>)> cb,
                               std::function<std::shared_ptr<UriHandler>()> next,
                               bool is_auto_fill) {
  FOOTSTONE_DLOG(INFO) << "ReadAssetFile file_path = " << path;
  {
    std::lock_guard<std::mutex> lock_guard(mutex_);
    if (!runner_) {
      runner_ = request->GetWorkerManager()->CreateTaskRunner(kRunnerName);
    }
  }
  runner_->PostTask([path, is_rawfile = is_rawfile_, manager = resource_manager_, res_module_name = res_module_name_, cb, is_auto_fill] {
    UriHandler::bytes content;
    bool ret = ReadAsset(path, is_rawfile, manager, res_module_name, content, is_auto_fill);
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

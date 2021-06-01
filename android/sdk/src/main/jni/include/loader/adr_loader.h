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

#pragma once

#include <android/asset_manager.h>

#include <map>

#include "core/core.h"
#include "jni/scoped_java_ref.h"

template <typename CharType>
bool ReadAsset(const unicode_string_view& path,
               AAssetManager* aasset_manager,
               std::basic_string<CharType>& bytes,
               bool is_auto_fill) {
  unicode_string_view owner(""_u8s);
  const char* asset_path = StringViewUtils::ToConstCharPointer(path, owner);
  std::string file_path = std::string(asset_path);
  if (file_path.length() > 0 && file_path[0] == '/') {
    file_path = file_path.substr(1);
    asset_path = file_path.c_str();
  }
  TDF_BASE_DLOG(INFO) << "asset_path = " << asset_path;

  auto asset =
      AAssetManager_open(aasset_manager, asset_path, AASSET_MODE_STREAMING);
  if (asset) {
    int size = AAsset_getLength(asset);
    if (is_auto_fill) {
      size += 1;
    }
    bytes.resize(size);
    int offset = 0;
    int readbytes;
    while ((readbytes = AAsset_read(asset, &bytes[0] + offset,
                                    bytes.size() - offset)) > 0) {
      offset += readbytes;
    }
    if (is_auto_fill) {
      bytes.back() = '\0';
    }
    AAsset_close(asset);
    TDF_BASE_DLOG(INFO) << "path = " << path << ", len = " << bytes.length()
                        << ", file_data = "
                        << reinterpret_cast<const char*>(bytes.c_str());
    return true;
  }
  TDF_BASE_DLOG(INFO) << "ReadFile fail, file_path = " << file_path;
  return false;
}

class ADRLoader : public hippy::base::UriLoader {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using u8string = unicode_string_view::u8string;

  ADRLoader();
  virtual ~ADRLoader() {}

  virtual bool RequestUntrustedContent(const unicode_string_view& uri,
                                       std::function<void(u8string)> cb);
  virtual bool RequestUntrustedContent(const unicode_string_view& uri,
                                       u8string& str);

  inline void SetBridge(std::shared_ptr<JavaRef> bridge) { bridge_ = bridge; }
  inline void SetAAssetManager(AAssetManager* aasset_manager) {
    aasset_manager_ = aasset_manager;
  }
  inline void SetWorkerTaskRunner(std::weak_ptr<WorkerTaskRunner> runner) {
    runner_ = runner;
  }
  std::function<void(u8string)> GetRequestCB(int64_t request_id);
  int64_t SetRequestCB(std::function<void(u8string)> cb);

 private:
  bool LoadByFile(const unicode_string_view& path,
                  std::function<void(u8string)> cb);
  bool LoadByAsset(const unicode_string_view& file_path,
                   std::function<void(u8string)> cb,
                   bool is_auto_fill = false);
  bool LoadByHttp(const unicode_string_view& uri,
                  std::function<void(u8string)> cb);

  std::shared_ptr<JavaRef> bridge_;
  AAssetManager* aasset_manager_;
  std::weak_ptr<WorkerTaskRunner> runner_;
  std::unordered_map<int64_t, std::function<void(u8string)>> request_map_;
};

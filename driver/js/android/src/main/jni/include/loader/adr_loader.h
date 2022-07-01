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
#include "footstone/check.h"
#include "jni/scoped_java_ref.h"

template <typename CharType>
bool ReadAsset(const footstone::stringview::unicode_string_view& path,
               AAssetManager* aasset_manager,
               std::basic_string<CharType>& bytes,
               bool is_auto_fill) {
  footstone::stringview::unicode_string_view owner(""_u8s);
  const char* asset_path = hippy::base::StringViewUtils::ToConstCharPointer(path, owner);
  std::string file_path = std::string(asset_path);
  if (file_path.length() > 0 && file_path[0] == '/') {
    file_path = file_path.substr(1);
    asset_path = file_path.c_str();
  }
  FOOTSTONE_DLOG(INFO) << "asset_path = " << asset_path;

  auto asset =
      AAssetManager_open(aasset_manager, asset_path, AASSET_MODE_STREAMING);
  if (asset) {
    size_t size;
    if (!footstone::check::numeric_cast<off_t, size_t>(AAsset_getLength(asset) + (is_auto_fill ? 1:0),
                                                  size)) {
      AAsset_close(asset);
      return false;
    }
    bytes.resize(size);
    size_t offset = 0;
    int readbytes;
    while ((readbytes = AAsset_read(asset, &bytes[0] + offset,
                                    bytes.size() - offset)) > 0) {
      offset += static_cast<size_t>(readbytes);
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

class ADRLoader : public hippy::base::UriLoader {
 public:
  using unicode_string_view = footstone::stringview::unicode_string_view;
  using u8string = unicode_string_view::u8string;
  using TaskRunner = footstone::TaskRunner;

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
  inline void SetWorkerTaskRunner(std::weak_ptr<TaskRunner> runner) {
    runner_ = runner;
  }
  std::function<void(u8string)> GetRequestCB(int64_t request_id);
  int64_t SetRequestCB(const std::function<void(u8string)>& cb);

 private:
  bool LoadByFile(const unicode_string_view& path,
                  const std::function<void(u8string)>& cb);
  bool LoadByAsset(const unicode_string_view& file_path,
                   const std::function<void(u8string)>& cb,
                   bool is_auto_fill = false);
  bool LoadByHttp(const unicode_string_view& uri,
                  const std::function<void(u8string)>& cb);

  std::shared_ptr<JavaRef> bridge_;
  AAssetManager* aasset_manager_;
  std::weak_ptr<TaskRunner> runner_;
  std::unordered_map<int64_t, std::function<void(u8string)>> request_map_;
};

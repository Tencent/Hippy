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

#include "core/core.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"
#include "jni/uri.h"

ADRLoader::ADRLoader() : aasset_manager_(nullptr) {}

std::string ADRLoader::LoadUntrustedContent(const std::string& uri) {
  std::shared_ptr<Uri> uri_obj = std::make_shared<Uri>(uri);
  std::string uri_schema = uri_obj->GetScheme();
  std::string path = uri_obj->GetPath();
  if (uri_schema == "file") {
    return LoadByFile(path);
  } else if (uri_schema == "http" || uri_schema == "https" ||
             uri_schema == "debug") {
    return LoadByHttp(uri, bridge_);
  } else if (uri_schema == "asset") {
    if (aasset_manager_) {
      return LoadByAsset(path, aasset_manager_, false);
    }

    HIPPY_LOG(hippy::Error, "aasset_manager error, uri = %s", uri.c_str());
    return "";
  } else {
    HIPPY_LOG(hippy::Error, "schema error, schema = %s", uri_schema.c_str());
    return "";
  }
}

std::string ADRLoader::LoadByFile(const std::string& path) {
  return hippy::base::HippyFile::ReadFile(path.c_str(), false);
}

std::string ADRLoader::LoadByAsset(const std::string& file_path,
                                   AAssetManager* aasset_manager,
                                   bool is_auto_fill) {
  HIPPY_LOG(hippy::Debug, "ReadAssetFile file_path = %s", file_path.c_str());

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

std::string ADRLoader::LoadByHttp(const std::string& uri,
                                  std::shared_ptr<JavaRef> bridge) {
  JNIEnv* env = JNIEnvironment::AttachCurrentThread();
  JNIEnvironment* instance = JNIEnvironment::GetInstance();
  if (instance->wrapper_.get_uri_content_method_id) {
    jstring j_relative_path = env->NewStringUTF(uri.c_str());
    jbyteArray j_rst = (jbyteArray)env->CallObjectMethod(
        bridge->GetObj(), instance->wrapper_.get_uri_content_method_id,
        j_relative_path);
    env->DeleteLocalRef(j_relative_path);
    return JniUtils::AppendJavaByteArrayToString(env, j_rst);
  }

  HIPPY_LOG(hippy::Error, "jni get_uri_content_method_id error");
  return "";
}

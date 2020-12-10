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

#include "core/javascript-loader.h"

#include <algorithm>
#include <fstream>
#include <memory>
#include <thread>  // NOLINT(build/c++11)
#include <utility>

JavaScriptLoader::JavaScriptLoader() : m_filePath(nullptr) {}

JavaScriptLoader::~JavaScriptLoader() {
  if (m_filePath) {
    free(m_filePath);
  }
  m_filePath = nullptr;

  m_complete = nullptr;
  m_progress = nullptr;
}

int JavaScriptLoader::loadBundleAtURL(const std::string& scriptURL,
                                      OnProgress progress,
                                      OnComplete complete) {
  int ret = 0;

  do {
    std::string localfile("file://");
    size_t prefixLen = localfile.length();
    if (scriptURL.length() <= prefixLen) {
      ret = -1;
      break;
    }

    std::string prefix = scriptURL.substr(0, prefixLen);
    std::transform(prefix.begin(), prefix.end(), prefix.begin(), ::tolower);
    bool isLocalFile = prefix.compare(localfile) == 0 ? true : false;

    if (isLocalFile) {
      std::shared_ptr<JavaScriptLoader> loader =
          std::make_shared<JavaScriptLoader>();
      std::thread([
        loader = std::move(loader), scriptURL, prefixLen, progress, complete
      ]() {
        loader->initLoader(scriptURL, static_cast<int>(prefixLen), progress,
                           complete);
        loader->threadFunc();
      });
    } else {  // net work;
    }
  } while (0);

  return ret;
}

void JavaScriptLoader::initLoader(const std::string& scriptURL, int pos,
                                  OnProgress progress, OnComplete complete) {
  std::string path = scriptURL.substr(pos);

  size_t length = path.length();
  auto str = reinterpret_cast<char*>(malloc(length));
  memcpy(str, path.c_str(), length);

  m_filePath = str;

  m_progress = progress;
  m_complete = complete;
}

void JavaScriptLoader::threadFunc() {
  std::ifstream ifs(m_filePath);
  std::string source((std::istreambuf_iterator<char>(ifs)),
                     (std::istreambuf_iterator<char>()));

  if (m_complete) {
    m_complete(0, source, source.length());
  }
}

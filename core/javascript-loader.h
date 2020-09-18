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

#ifndef CORE_JAVASCRIPT_LOADER_H_
#define CORE_JAVASCRIPT_LOADER_H_

#include <stdint.h>

#include <functional>
#include <string>

typedef std::function<void(int, int64_t, int64_t)> OnProgress;
typedef std::function<void(int, const std::string&, int64_t)> OnComplete;

class JavaScriptLoader {
 public:
  JavaScriptLoader();
  virtual ~JavaScriptLoader();

  static int LoadBundleAtURL(const std::string& scriptURL,
                             OnProgress progress,
                             OnComplete complete);

 private:
  void InitLoader(const std::string& scriptURL,
                  int pos,
                  OnProgress progress,
                  OnComplete complete);
  void ThreadFunc();

 private:
  char* file_path_;
  OnProgress progress_;
  OnComplete complete_;
};

#endif  // CORE_JAVASCRIPT_LOADER_H_

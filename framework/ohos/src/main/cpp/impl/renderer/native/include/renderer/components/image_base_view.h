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

#include "renderer/components/base_view.h"
#include "renderer/arkui/image_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class ImageBaseView : public BaseView {
public:
  ImageBaseView(std::shared_ptr<NativeRenderContext> &ctx);
  ~ImageBaseView();

  virtual void OnFetchLocalPathAsyncResult(bool success, const std::string &path);

protected:
  void FetchAltImage(const std::string &imageUrl);
  void FetchImage(const std::string &imageUrl);

  std::string GetLocalPathFromAdapter(const std::string &imageUrl);
  bool GetLocalPathAsyncFromAdapter(const std::string &imageUrl);
  
  virtual void SetSourcesOrAlt(const std::string &imageUrl, bool isSources) {}
};

} // namespace native
} // namespace render
} // namespace hippy

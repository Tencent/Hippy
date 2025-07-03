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

#include "renderer/components/image_base_view.h"
#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

ImageBaseView::ImageBaseView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

ImageBaseView::~ImageBaseView() {}

void ImageBaseView::FetchAltImage(const std::string &imageUrl) {
  if (imageUrl.size() > 0) {
    SetSourcesOrAlt(imageUrl, false);
  }
}

void ImageBaseView::FetchImage(const std::string &imageUrl) {
  if (imageUrl.size() > 0) {
    auto localPath = GetLocalPathFromAdapter(imageUrl);
    if (localPath.length() > 0) {
      SetSourcesOrAlt(localPath, true);
    } else {
      if (!GetLocalPathAsyncFromAdapter(imageUrl)) {
        SetSourcesOrAlt(imageUrl, true);
      }
    }
	}
}

void ImageBaseView::OnFetchLocalPathAsyncResult(bool success, const std::string &path) {
  if (success) {
    SetSourcesOrAlt(path, true);
  }
}

std::string ImageBaseView::GetLocalPathFromAdapter(const std::string &imageUrl) {
  auto ts_local_loader_ref = ctx_->GetNativeRender().lock()->GetTsImageLocalLoaderRef();
  if (ts_local_loader_ref) {
    ArkTS arkTs(ts_env_);
    auto ts_loader = arkTs.GetReferenceValue(ts_local_loader_ref);
    OhNapiObject ts_obj = arkTs.GetObject(ts_loader);
    std::vector<napi_value> args = {
      arkTs.CreateString(imageUrl)
    };
    auto ts_ret = ts_obj.Call("fetchLocalPath", args);
    if (arkTs.GetType(ts_ret) == napi_string) {
      std::string path = arkTs.GetString(ts_ret);
      return path;
    }
  }
  return "";
}

bool ImageBaseView::GetLocalPathAsyncFromAdapter(const std::string &imageUrl) {
  auto ts_remote_loader_ref = ctx_->GetNativeRender().lock()->GetTsImageRemoteLoaderRef();
  if (ts_remote_loader_ref) {
    ArkTS arkTs(ts_env_);
    auto ts_loader = arkTs.GetReferenceValue(ts_remote_loader_ref);
    OhNapiObject ts_obj = arkTs.GetObject(ts_loader);
    std::vector<napi_value> args = {
      arkTs.CreateUint32(ctx_->GetRootId()),
      arkTs.CreateUint32(GetTag()),
      arkTs.CreateString(imageUrl)
    };
    ts_obj.Call("fetchLocalPathAsync", args);
    return true;
  }
  return false;
}

} // namespace native
} // namespace render
} // namespace hippy

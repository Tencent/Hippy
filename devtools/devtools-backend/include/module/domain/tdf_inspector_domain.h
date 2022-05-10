/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#pragma once

#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/domain_register.h"
#include "module/model/frame_poll_model.h"
#include "module/model/screen_shot_model.h"
#include "module/model/tdf_inspector_model.h"
#include "module/request/base_request.h"
#include "module/request/screen_shot_request.h"
#include "module/request/selected_render_object_request.h"

namespace hippy::devtools {

/**
 * @brief UIInspect domain relative with DOM、Render、Layer Tree
 */
class TDFInspectorDomain : public BaseDomain {
 public:
  explicit TDFInspectorDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string GetDomainName() override;
  void RegisterMethods() override;

 private:
  std::shared_ptr<TDFInspectorModel> tdf_inspector_model_;
  std::shared_ptr<FramePollModel> frame_poll_model_;
  std::shared_ptr<ScreenShotModel> screen_shot_model_;

  void DumpDomTree(const BaseRequest& request);

  /**
   * @brief get dom tree
   */
  void GetDomTree(const BaseRequest& request);

  /**
   * @brief get selecting dom node info
   */
  void GetSelectedDomNode(const BaseRequest& request);

  /**
   * @brief get render tree
   */
  void GetRenderTree(const BaseRequest& request);

  /**
   * @brief get selecting render node info
   */
  void GetSelectedRenderObject(const SelectedRenderObjectRequest& request);

  /**
   * @brief get screenshot in current page
   */
  void GetScreenshot(const ScreenShotRequest& request);

  /**
   * @brief enable screenshot update switch
   */
  void EnableUpdateNotification(const BaseRequest& request);

  /**
   * @brief disable screenshot update switch
   */
  void DisableUpdateNotification(const BaseRequest& request);

  void HandleFramePollModelRefreshNotification();

  void HandleScreenShotUpdatedNotification();

  /**
   * @brief notify render tree update event
   */
  void SendRenderTreeUpdatedEvent();
};

}  // namespace hippy::devtools

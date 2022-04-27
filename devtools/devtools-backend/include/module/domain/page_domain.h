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
#include "module/model/frame_poll_model.h"
#include "module/model/screen_shot_model.h"
#include "module/request/domain_base_request.h"

namespace hippy::devtools {

class PageDomain : public BaseDomain {
 public:
  explicit PageDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void StartScreencast(const ScreenShotRequest& request);
  void StopScreencast(const Deserializer& request);
  void ScreencastFrameAck(const Deserializer& request);

  /**
   * @brief 处理帧更新通知
   */
  void HandleFramePollModelRefreshNotification();

  /**
   * @brief 处理截屏更新通知
   */
  void HandleScreenShotUpdatedNotification();
  std::shared_ptr<FramePollModel> frame_poll_model_;
  std::shared_ptr<ScreenShotModel> screen_shot_model_;
};

}  // namespace devtools::devtools

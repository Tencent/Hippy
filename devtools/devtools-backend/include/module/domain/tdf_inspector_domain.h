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
#include "module/request/domain_base_request.h"
#include "module/request/screen_shot_request.h"
#include "module/request/selected_render_object_request.h"

namespace hippy::devtools {

/**
 * @brief UI 调试，主要涉及 DOM、Render、Layer Tree
 */
class TDFInspectorDomain : public BaseDomain {
 public:
  explicit TDFInspectorDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  std::shared_ptr<TDFInspectorModel> tdf_inspector_model_;
  std::shared_ptr<FramePollModel> frame_poll_model_;
  std::shared_ptr<ScreenShotModel> screen_shot_model_;

  // Dump Dom Tree
  void DumpDomTree(const Deserializer& request);

  /**
   * @brief 获取 DOM Tree，节点信息包含区域
   */
  void GetDomTree(const Deserializer& request);

  /**
   * @brief 获取选中的 DOM 节点的详细信息
   */
  void GetSelectedDomNode(const Deserializer& request);

  /**
   * @brief 获取 Render Tree，节点信息包含区域
   */
  void GetRenderTree(const Deserializer& request);

  /**
   * @brief 获取选中的 Render 节点详细信息
   */
  void GetSelectedRenderObject(const SelectedRenderObjectRequest& request);

  /**
   * @brief 获取界面截图
   */
  void GetScreenshot(const ScreenShotRequest& request);

  /**
   * @brief 打开更新通知开关
   */
  void EnableUpdateNotification(const Deserializer& request);

  /**
   * @brief 关闭更新通知开关
   */
  void DisableUpdateNotification(const Deserializer& request);

  /**
   * @brief 处理帧更新通知
   */
  void HandleFramePollModelRefreshNotification();

  /**
   * @brief 处理截屏更新通知
   */
  void HandleScreenShotUpdatedNotification();

  /**
   * @brief 通知 render tree 更新事件
   */
  void SendRenderTreeUpdatedEvent();
};

}  // namespace devtools::devtools

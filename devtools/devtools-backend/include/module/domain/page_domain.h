//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/16.
//

#pragma once

#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/model/frame_poll_model.h"
#include "module/model/screen_shot_model.h"
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {

class PageDomain : public BaseDomain {
 public:
  explicit PageDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void StartScreencast(const ScreenShotRequest& request);
  void StopScreencast(const DomainBaseRequest& request);
  void ScreencastFrameAck(const DomainBaseRequest& request);

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

}  // namespace devtools
}  // namespace tdf

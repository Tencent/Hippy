//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

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

namespace tdf {
namespace devtools {

/**
 * @brief UI 调试，主要涉及 DOM、Render、Layer Tree
 */
class TDFInspectorDomain : public BaseDomain, public std::enable_shared_from_this<TDFInspectorDomain> {
 public:
  explicit TDFInspectorDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  std::shared_ptr<TDFInspectorModel> tdf_inspector_model_;
  std::shared_ptr<FramePollModel> frame_poll_model_;
  std::shared_ptr<ScreenShotModel> screen_shot_model_;

  // Dump Dom Tree
  void DumpDomTree(const DomainBaseRequest& request);

  /**
   * @brief 获取 DOM Tree，节点信息包含区域
   */
  void GetDomTree(const DomainBaseRequest& request);

  /**
   * @brief 获取选中的 DOM 节点的详细信息
   */
  void GetSelectedDomNode(const DomainBaseRequest& request);

  /**
   * @brief 获取 Render Tree，节点信息包含区域
   */
  void GetRenderTree(const DomainBaseRequest& request);

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
  void EnableUpdateNotification(const DomainBaseRequest& request);

  /**
   * @brief 关闭更新通知开关
   */
  void DisableUpdateNotification(const DomainBaseRequest& request);

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

}  // namespace devtools
}  // namespace tdf
